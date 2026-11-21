from django.contrib import admin
from .models import Post, PostImage, Comment

class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 1

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'status',
        'created_date',
        'updated_date',
        'image_count',
    )
    list_filter = (
        'status',
        'created_date',
    )
    search_fields = (
        'title',
        'content',
    )
    readonly_fields = (
        'created_date',
        'updated_date',
    )
    inlines = [PostImageInline]

    def image_count(self, obj):
        return obj.images.count()
    
    image_count.short_description = 'Images'

@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = (
        'post',
        'caption',
        'image',
    )
    list_filter = (
        'post',
    )


# comment part
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "post",
        "created_at",
        "is_approved",
    )
    list_filter = ("is_approved", "created_at")
    search_fields = ("name", "body", "post__title")
    list_editable = ("is_approved",)