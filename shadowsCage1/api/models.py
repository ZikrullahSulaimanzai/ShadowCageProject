from django.db import models
from django.utils import timezone
from django.conf import settings

class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=200, help_text="Title of the blog post (max 200 characters)")
    content = models.TextField(blank=True, default='', help_text="Main content of the blog post (supports markdown/HTML)")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', help_text="Publication status: 'draft' or 'published'")
    created_date = models.DateTimeField(default=timezone.now, help_text="Timestamp when the post was created")
    updated_date = models.DateTimeField(auto_now=True, help_text="Timestamp when the post was last updated")

    class Meta:
        ordering = ['-created_date']
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        return self.title

    @property
    def is_published(self):
        return self.status == 'published'

class PostImage(models.Model):
    post = models.ForeignKey(Post, related_name='images', on_delete=models.CASCADE, help_text="The post this image belongs to")
    image = models.ImageField(upload_to='post_images/%Y/%m/%d/', help_text="Image file (JPG, PNG, GIF, etc.)")
    caption = models.CharField(max_length=200, blank=True, default='', help_text="Optional description/caption for the image")

    class Meta:
        verbose_name = "Post Image"
        verbose_name_plural = "Post Images"
        ordering = ['id']

    def __str__(self):
        return f"Image for {self.post.title}"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

# comment part
class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="replies",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blog_comments",
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.name} on {self.post.title}"

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        default="",
    )
    avatar = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"Profile of {self.user.username}"

class Report(models.Model):

    REASON_CHOICES = (
        ("spam", "Spam"),
        ("harassment", "Harassment or Bullying"),
        ("hate_speech", "Hate Speech"),
        ("inappropriate", "Inappropriate Content"),
        ("misinformation", "False or Misleading Information"),
        ("other", "Other"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("reviewed", "Reviewed"),
        ("dismissed", "Dismissed"),
    )

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submitted_reports",
    )

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="reports",
        null=True,
        blank=True,
    )

    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="reports",
        null=True,
        blank=True,
    )

    reason = models.CharField(
        max_length=30,
        choices=REASON_CHOICES,
    )

    description = models.TextField(
        max_length=1000,
        blank=True,
        default="",
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(post__isnull=False, comment__isnull=True)
                    | models.Q(post__isnull=True, comment__isnull=False)
                ),
                name="report_exactly_one_target",
            ),
            models.UniqueConstraint(
                fields=["reporter", "post"],
                condition=models.Q(post__isnull=False),
                name="unique_user_post_report",
            ),
            models.UniqueConstraint(
                fields=["reporter", "comment"],
                condition=models.Q(comment__isnull=False),
                name="unique_user_comment_report",
            ),
        ]

    def __str__(self):
        target = (
            f"Post: {self.post.title}"
            if self.post_id
            else f"Comment: {self.comment_id}"
        )

        return f"Report by {self.reporter.username} - {target}"