from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, permissions, status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from rest_framework.throttling import ScopedRateThrottle

from .models import Post, PostImage, Comment, UserProfile, Report
from django.contrib.auth import get_user_model
from django.utils import timezone

from .serializers import (
    PostSerializer,
    PostListSerializer,
    PostImageSerializer,
    PostImageUploadSerializer,
    RegistrationSerializer,
    CurrentUserSerializer,
    ChangePasswordSerializer,
    CommentSerializer,
    AdminUserSerializer,
    ReportCreateSerializer,
    AdminReportSerializer,
)

# =====================================================
# AUTHENTICATION
# =====================================================


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    def get_object(self):
        user = self.request.user

        UserProfile.objects.get_or_create(user=user)

        return user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Your password has been changed successfully."},
            status=status.HTTP_200_OK,
        )


# =====================================================
# PERMISSIONS
# =====================================================


class IsAdminUser(permissions.BasePermission):
    """Allow access only to authenticated staff users."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


# =====================================================
# ADMIN DASHBOARD
# =====================================================


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        User = get_user_model()

        stats = {
            "total_posts": Post.objects.count(),
            "published_posts": Post.objects.filter(status="published").count(),
            "draft_posts": Post.objects.filter(status="draft").count(),
            "total_users": User.objects.count(),
            "total_comments": Comment.objects.count(),
        }

        return Response(stats, status=status.HTTP_200_OK)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = get_user_model().objects.all().order_by("-date_joined")


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_user(self, user_id):
        User = get_user_model()

        return get_object_or_404(
            User,
            id=user_id,
        )

    # Activate or deactivate a user account.
    def patch(self, request, user_id):
        target_user = self.get_user(user_id)

        # Prevent managing your own account.
        if target_user.id == request.user.id:
            return Response(
                {
                    "detail": (
                        "You cannot deactivate or change " "your own account here."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Protect administrator and superuser accounts.
        if target_user.is_staff or target_user.is_superuser:
            return Response(
                {"detail": ("Staff and superuser accounts " "cannot be managed here.")},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only allow the is_active field.
        if set(request.data.keys()) != {"is_active"}:
            return Response(
                {"detail": ("Only the is_active field " "can be changed.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(request.data.get("is_active"), bool):
            return Response(
                {"detail": "is_active must be true or false."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user.is_active = request.data["is_active"]
        target_user.save(update_fields=["is_active"])

        serializer = AdminUserSerializer(target_user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # Permanently delete a user account.
    def delete(self, request, user_id):
        target_user = self.get_user(user_id)

        # Prevent deleting your own account.
        if target_user.id == request.user.id:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Protect administrator and superuser accounts.
        if target_user.is_staff or target_user.is_superuser:
            return Response(
                {"detail": ("Staff and superuser accounts " "cannot be deleted here.")},
                status=status.HTTP_403_FORBIDDEN,
            )

        username = target_user.username
        target_user.delete()

        return Response(
            {"message": f"User '{username}' was deleted successfully."},
            status=status.HTTP_200_OK,
        )


# =====================================================
# REPORTS
# =====================================================


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "reports"


class AdminReportListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminReportSerializer

    queryset = Report.objects.select_related(
        "reporter",
        "post",
        "comment",
    ).all()


class AdminReportDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_report(self, report_id):
        return get_object_or_404(
            Report.objects.select_related(
                "reporter",
                "post",
                "comment",
            ),
            id=report_id,
        )

    def get(self, request, report_id):
        report = self.get_report(report_id)
        serializer = AdminReportSerializer(report)

        return Response(serializer.data)

    def patch(self, request, report_id):
        report = self.get_report(report_id)

        new_status = request.data.get("status")
        allowed_statuses = ["reviewed", "dismissed"]

        if new_status not in allowed_statuses:
            return Response(
                {"detail": ("Status must be 'reviewed' or 'dismissed'.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.status = new_status
        report.reviewed_at = timezone.now()

        report.save(update_fields=["status", "reviewed_at"])

        serializer = AdminReportSerializer(report)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, report_id):
        report = self.get_report(report_id)
        report.delete()

        return Response(
            {"message": "Report deleted successfully."},
            status=status.HTTP_200_OK,
        )


# =====================================================
# POSTS
# =====================================================


@extend_schema_view(
    post=extend_schema(
        request=PostSerializer,
        responses={201: PostSerializer},
    ),
)
class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    # Search in post title and content.
    filter_backends = [SearchFilter]
    search_fields = ["title", "content"]

    def get_permissions(self):
        if self.request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return [IsAdminUser()]

        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PostListSerializer

        return PostSerializer

    def get_queryset(self):
        queryset = Post.objects.all().order_by("-created_date")

        is_staff = self.request.user.is_authenticated and self.request.user.is_staff

        if not is_staff:
            queryset = queryset.filter(status="published")

        post_status = self.request.query_params.get("status")

        if post_status and is_staff:
            queryset = queryset.filter(status=post_status)

        return queryset


class PublicPostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter]
    search_fields = ["title", "content"]

    def get_queryset(self):
        return Post.objects.filter(status="published").order_by("-created_date")


@extend_schema_view(
    put=extend_schema(
        request=PostSerializer,
        responses={200: PostSerializer},
    ),
    patch=extend_schema(
        request=PostSerializer,
        responses={200: PostSerializer},
    ),
)
class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    lookup_field = "id"

    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUser()]

        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Post.objects.all()

        is_staff = self.request.user.is_authenticated and self.request.user.is_staff

        if not is_staff:
            queryset = queryset.filter(status="published")

        return queryset


# =====================================================
# POST IMAGE MANAGEMENT
# =====================================================


@extend_schema(
    request=PostImageUploadSerializer,
    responses={201: PostImageSerializer(many=True)},
)
class PostImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            id=post_id,
        )

        serializer = PostImageUploadSerializer(
            data=request.data,
            context={
                "request": request,
                "post": post,
            },
        )

        serializer.is_valid(raise_exception=True)
        created_images = serializer.save()

        response_serializer = PostImageSerializer(
            created_images,
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "message": (
                    f"{len(created_images)} image(s) " "uploaded successfully."
                ),
                "images": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class PostDeleteImageView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, post_id, image_id):
        post = get_object_or_404(
            Post,
            id=post_id,
        )

        image = get_object_or_404(
            PostImage,
            id=image_id,
            post=post,
        )

        image.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


# =====================================================
# COMMENTS
# =====================================================


class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "comments"

    def get_throttles(self):
        # Apply rate limiting only to comment creation and replies.
        if self.request.method == "POST":
            return [ScopedRateThrottle()]

        # Reading comments does not consume the comment limit.
        return []

    def get_post(self):
        queryset = Post.objects.all()

        # Regular users can access published posts only.
        # Admins can also access draft posts.
        if not self.request.user.is_staff:
            queryset = queryset.filter(status="published")

        return get_object_or_404(
            queryset,
            id=self.kwargs["post_id"],
        )

    def get_queryset(self):
        post = self.get_post()

        # Return top-level comments.
        # Replies are included by CommentSerializer.
        return (
            Comment.objects.filter(post=post)
            .filter(parent__isnull=True)
            .order_by("created_at")
        )

    def perform_create(self, serializer):
        post = self.get_post()

        serializer.save(
            post=post,
            user=self.request.user,
        )


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id, comment_id):

        # Regular users can access published posts only.
        # Admins can access published and draft posts.
        post_queryset = Post.objects.all()

        if not request.user.is_staff:
            post_queryset = post_queryset.filter(status="published")

        post = get_object_or_404(
            post_queryset,
            id=post_id,
        )

        comment = get_object_or_404(
            Comment,
            id=comment_id,
            post=post,
        )

        # Admins can delete any comment or reply.
        if request.user.is_staff:
            comment.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        # Regular users can delete only their own comments.
        if comment.user_id != request.user.id:
            return Response(
                {"detail": ("You can only delete your own comments.")},
                status=status.HTTP_403_FORBIDDEN,
            )

        comment.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
