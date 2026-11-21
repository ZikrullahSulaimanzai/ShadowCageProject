from django.urls import path

from .views import (
    PublicPostListView,
    PostListCreateView,
    PostDetailView,
    PostImageUploadView,
    PostDeleteImageView,
    PostCommentListCreateView,
    RegisterView,
    CurrentUserView,
    CommentDeleteView,
    ChangePasswordView,  
    AdminDashboardStatsView,  
    AdminUserListView,
    AdminUserDetailView,
    ReportCreateView,
    AdminReportListView,
    AdminReportDetailView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

app_name = "api"


urlpatterns = [
    # Public landing page: published posts only.
    path(
        "posts/public/",
        PublicPostListView.as_view(),
        name="public-posts",
    ),
    path(
        "admin/dashboard/stats/",
        AdminDashboardStatsView.as_view(),
        name="admin-dashboard-stats",
    ),
    # List posts or create a post.
    path(
        "posts/",
        PostListCreateView.as_view(),
        name="post-list-create",
    ),
    
    path(
        "admin/users/",
        AdminUserListView.as_view(),
        name="admin-users",
    ),
    path(
        "admin/users/<int:user_id>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),

    path("reports/", ReportCreateView.as_view(), name="report-create"),

    path("admin/reports/", AdminReportListView.as_view(), name="admin-reports"),

    path(
        "admin/reports/<int:report_id>/",
        AdminReportDetailView.as_view(),
        name="admin-report-detail",
    ),
    # Retrieve, update, or delete one post.
    path(
        "posts/<int:id>/",
        PostDetailView.as_view(),
        name="post-detail",
    ),

    # Upload multiple images to an existing post.
    path(
        "posts/<int:post_id>/upload-images/",
        PostImageUploadView.as_view(),
        name="upload-images",
    ),

    # Delete one image from a post.
    path(
        "posts/<int:post_id>/images/<int:image_id>/delete/",
        PostDeleteImageView.as_view(),
        name="delete-image",
    ),
    # comment
    path(
       "posts/<int:post_id>/comments/",
       PostCommentListCreateView.as_view(),
        name="post-comments",
    ),
    path(
    "posts/<int:post_id>/comments/<int:comment_id>/delete/",
    CommentDeleteView.as_view(),
    name="comment-delete",
),
]
#Auth part start
urlpatterns += [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="auth-token"),
    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="auth-token-refresh",
    ),
    path("auth/me/", CurrentUserView.as_view(), name="auth-me"),
    path(
    "auth/change-password/",
    ChangePasswordView.as_view(),
    name="change-password",
    ),
]
#Auth part finish
