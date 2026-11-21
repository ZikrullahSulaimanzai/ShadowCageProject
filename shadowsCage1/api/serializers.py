from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Post, PostImage, Comment, UserProfile, Report

User = get_user_model()


# =====================================================
# IMAGE UPLOAD LIMITS
# =====================================================

MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_IMAGES_PER_REQUEST = 10
MAX_IMAGES_PER_POST = 20


def validate_post_images(images, existing_count=0, field_name="images"):
    if len(images) > MAX_IMAGES_PER_REQUEST:
        raise serializers.ValidationError(
            {
                field_name: (
                    f"You can upload a maximum of "
                    f"{MAX_IMAGES_PER_REQUEST} images per request."
                )
            }
        )

    if existing_count + len(images) > MAX_IMAGES_PER_POST:
        raise serializers.ValidationError(
            {
                field_name: (
                    f"A post can contain a maximum of "
                    f"{MAX_IMAGES_PER_POST} images in total. "
                    f"This post currently has {existing_count} images."
                )
            }
        )

    for index, image in enumerate(images, start=1):
        if image.size > MAX_POST_IMAGE_SIZE:
            raise serializers.ValidationError(
                {field_name: (f"Image {index} exceeds the 5 MB file size limit.")}
            )


# =====================================================
# AUTHENTICATION
# =====================================================


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password_confirm",
        ]
        read_only_fields = ["id"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User(**validated_data)

        # Every registered account starts as a regular active user.
        user.is_staff = False
        user.is_superuser = False
        user.is_active = True

        user.set_password(password)
        user.save()

        return user


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "is_staff",
            "date_joined",
        ]


class CurrentUserSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )

    avatar = serializers.ImageField(
        required=False,
        allow_null=True,
        write_only=True,
    )

    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_staff",
            "date_joined",
            "bio",
            "avatar",
            "avatar_url",
        ]
        read_only_fields = [
            "id",
            "is_staff",
            "date_joined",
            "avatar_url",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if (
            User.objects.filter(email__iexact=value)
            .exclude(pk=self.instance.pk)
            .exists()
        ):
            raise serializers.ValidationError("This email address is already in use.")

        return value

    def get_avatar_url(self, obj):
        profile = getattr(obj, "profile", None)

        if not profile or not profile.avatar:
            return None

        request = self.context.get("request")
        url = profile.avatar.url

        return request.build_absolute_uri(url) if request else url

    def to_representation(self, instance):
        data = super().to_representation(instance)

        profile = getattr(instance, "profile", None)
        data["bio"] = profile.bio if profile else ""

        return data

    def update(self, instance, validated_data):
        bio = validated_data.pop("bio", None)
        avatar = validated_data.pop("avatar", serializers.empty)

        instance = super().update(instance, validated_data)

        profile, created = UserProfile.objects.get_or_create(user=instance)

        if bio is not None:
            profile.bio = bio

        if avatar is not serializers.empty:
            profile.avatar = avatar

        if bio is not None or avatar is not serializers.empty:
            profile.save()

        return instance

    def validate_avatar(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Profile picture cannot exceed 5 MB.")

        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={"input_type": "password"},
    )

    confirm_new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    def validate_current_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError("Your current password is incorrect.")

        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        validate_password(value, user=user)

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": "The new passwords do not match."}
            )

        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": (
                        "Your new password must be different "
                        "from your current password."
                    )
                }
            )

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user

        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        return user


# =====================================================
# COMMENTS
# =====================================================


class CommentSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        required=False,
        allow_null=True,
    )

    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "parent",
            "user",
            "name",
            "body",
            "created_at",
            "replies",
        ]
        read_only_fields = [
            "id",
            "post",
            "user",
            "created_at",
            "replies",
        ]
        extra_kwargs = {
            "name": {"required": False},
        }

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Name cannot be empty.")

        return value

    def validate_body(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")

        return value

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("You must be authenticated to comment.")

        # Always use the authenticated user's username.
        attrs["name"] = request.user.username

        return attrs

    def validate_parent(self, parent):
        if parent is None:
            return parent

        view = self.context.get("view")

        if not view or "post_id" not in view.kwargs:
            raise serializers.ValidationError("Unable to validate the parent comment.")

        post_id = view.kwargs["post_id"]

        if parent.post_id != post_id:
            raise serializers.ValidationError(
                "You can only reply to a comment on this post."
            )

        return parent

    def get_replies(self, obj):
        replies = obj.replies.all().order_by("created_at")

        return CommentSerializer(
            replies,
            many=True,
            context=self.context,
        ).data


# =====================================================
# MULTIPLE FILE FIELD
# =====================================================


class MultipleValueField(serializers.ListField):
    """Read repeated multipart fields, such as multiple uploaded files."""

    def get_value(self, dictionary):
        if hasattr(dictionary, "getlist"):
            values = dictionary.getlist(self.field_name)

            if values:
                return values

        return super().get_value(dictionary)


# =====================================================
# POST IMAGES
# =====================================================


class PostImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ["id", "image", "image_url", "caption"]
        read_only_fields = ["id", "image_url"]

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get("request")
        url = obj.image.url

        return request.build_absolute_uri(url) if request else url


# =====================================================
# POSTS
# =====================================================


class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)

    uploaded_images = MultipleValueField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    image_captions = MultipleValueField(
        child=serializers.CharField(allow_blank=True),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "content",
            "status",
            "created_date",
            "updated_date",
            "images",
            "uploaded_images",
            "image_captions",
        ]
        read_only_fields = [
            "id",
            "created_date",
            "updated_date",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Title cannot be empty.")

        return value

    def validate(self, attrs):
        images = attrs.get("uploaded_images", [])
        captions = attrs.get("image_captions", [])

        existing_count = self.instance.images.count() if self.instance else 0

        validate_post_images(
            images,
            existing_count=existing_count,
            field_name="uploaded_images",
        )

        if captions and len(captions) != len(images):
            raise serializers.ValidationError(
                {
                    "image_captions": (
                        "Provide one caption for each uploaded image. "
                        "Send an empty caption if an image has no caption."
                    )
                }
            )

        return attrs

    def _save_images(self, post, images, captions):
        for index, image in enumerate(images):
            caption = captions[index] if index < len(captions) else ""

            PostImage.objects.create(
                post=post,
                image=image,
                caption=caption,
            )

    def create(self, validated_data):
        images = validated_data.pop("uploaded_images", [])
        captions = validated_data.pop("image_captions", [])

        post = Post.objects.create(**validated_data)
        self._save_images(post, images, captions)

        return post

    def update(self, instance, validated_data):
        images = validated_data.pop("uploaded_images", [])
        captions = validated_data.pop("image_captions", [])

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        # Newly uploaded images are added; existing images are preserved.
        self._save_images(instance, images, captions)

        return instance


class PostListSerializer(serializers.ModelSerializer):
    images_count = serializers.SerializerMethodField()
    image_thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "status",
            "created_date",
            "updated_date",
            "images_count",
            "image_thumbnail",
        ]

    def get_images_count(self, obj):
        return obj.images.count()

    def get_image_thumbnail(self, obj):
        first_image = obj.images.first()

        if not first_image or not first_image.image:
            return None

        request = self.context.get("request")
        url = first_image.image.url

        return request.build_absolute_uri(url) if request else url


class PostImageUploadSerializer(serializers.Serializer):
    """Validate and save images uploaded to an existing post."""

    images = MultipleValueField(
        child=serializers.ImageField(),
        write_only=True,
        allow_empty=False,
    )

    image_captions = MultipleValueField(
        child=serializers.CharField(allow_blank=True),
        required=False,
        allow_empty=True,
        write_only=True,
    )

    caption = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    def validate(self, attrs):
        images = attrs.get("images", [])
        captions = attrs.get("image_captions", [])

        post = self.context["post"]

        validate_post_images(
            images,
            existing_count=post.images.count(),
            field_name="images",
        )

        if captions and len(captions) != len(images):
            raise serializers.ValidationError(
                {"image_captions": ("Provide one caption for each uploaded image.")}
            )

        return attrs

    def create(self, validated_data):
        post = self.context["post"]
        images = validated_data["images"]
        captions = validated_data.get("image_captions", [])
        shared_caption = validated_data.get("caption", "")

        created_images = []

        for index, image in enumerate(images):
            if captions:
                image_caption = captions[index]
            else:
                image_caption = shared_caption

            created_images.append(
                PostImage.objects.create(
                    post=post,
                    image=image,
                    caption=image_caption,
                )
            )

        return created_images


# =====================================================
# REPORTS
# =====================================================


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "post",
            "comment",
            "reason",
            "description",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        post = attrs.get("post")
        comment = attrs.get("comment")

        # A report must target exactly one post or comment.
        if bool(post) == bool(comment):
            raise serializers.ValidationError(
                "You must report either a post or a comment, not both."
            )

        user = self.context["request"].user

        # Normal users can only report published posts.
        if post and not user.is_staff and post.status != "published":
            raise serializers.ValidationError(
                {"post": "You cannot report a post you cannot access."}
            )

        # Normal users can only report comments on published posts.
        if comment and not user.is_staff and comment.post.status != "published":
            raise serializers.ValidationError(
                {"comment": "You cannot report a comment you cannot access."}
            )

        # Prevent duplicate reports for the same target.
        if (
            post
            and Report.objects.filter(
                reporter=user,
                post=post,
            ).exists()
        ):
            raise serializers.ValidationError(
                {"post": "You have already reported this post."}
            )

        if (
            comment
            and Report.objects.filter(
                reporter=user,
                comment=comment,
            ).exists()
        ):
            raise serializers.ValidationError(
                {"comment": "You have already reported this comment."}
            )

        return attrs

    def create(self, validated_data):
        return Report.objects.create(
            reporter=self.context["request"].user,
            **validated_data,
        )


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(
        source="reporter.username",
        read_only=True,
    )

    post_title = serializers.CharField(
        source="post.title",
        read_only=True,
        allow_null=True,
    )

    comment_body = serializers.CharField(
        source="comment.body",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter_username",
            "post",
            "post_title",
            "comment",
            "comment_body",
            "reason",
            "description",
            "status",
            "created_at",
            "reviewed_at",
        ]
        read_only_fields = [
            "id",
            "reporter_username",
            "post",
            "post_title",
            "comment",
            "comment_body",
            "reason",
            "description",
            "created_at",
            "reviewed_at",
        ]
