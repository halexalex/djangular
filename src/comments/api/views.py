from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import (CreateAPIView, DestroyAPIView,
                                     ListAPIView, RetrieveAPIView,
                                     RetrieveUpdateAPIView, UpdateAPIView)
from rest_framework.mixins import DestroyModelMixin, UpdateModelMixin
from rest_framework.permissions import (AllowAny, IsAdminUser, IsAuthenticated,
                                        IsAuthenticatedOrReadOnly)

from comments.models import Comment
from posts.api.pagination import (PostLimitOffsetPagination,
                                  PostPageNumberPagination)
from posts.api.permissions import IsOwnerOrReadOnly

from .serializers import (CommentCreateSerializer, CommentDetailSerializer, CommentListSerializer,
                          create_comment_serializer)


class CommentCreateAPIView(CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentCreateSerializer

    def get_serializer_context(self):
        context = super(CommentCreateAPIView, self).get_serializer_context()
        context['user'] = self.request.user
        return context


class CommentDetailAPIView(DestroyModelMixin, UpdateModelMixin, RetrieveAPIView):
    queryset = Comment.objects.filter(id__gte=0)
    serializer_class = CommentDetailSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# class PostUpdateAPIView(RetrieveUpdateAPIView):
#     queryset = Post.objects.all()
#     serializer_class = PostCreateUpdateSerializer
#     lookup_field = 'slug'
#     permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
#     #lookup_url_kwarg = "abc"
#     def perform_update(self, serializer):
#         serializer.save(user=self.request.user)
#         #email send_email


# class PostDeleteAPIView(DestroyAPIView):
#     queryset = Post.objects.all()
#     serializer_class = PostDetailSerializer
#     lookup_field = 'slug'
#     permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
#     #lookup_url_kwarg = "abc"


class CommentListAPIView(ListAPIView):
    serializer_class = CommentListSerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['content', 'user__first_name']
    pagination_class = PostPageNumberPagination  # PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #  queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        queryset_list = []
        query = self.request.GET.get("q")
        slug = self.request.GET.get("slug")  # Content we commented on
        type = self.request.GET.get("type", "post")  # Content type
        if slug:
            model_type = type
            model_qs = ContentType.objects.filter(model=model_type)
            if model_qs.exists():
                SomeModel = model_qs.first().model_class()
                obj_qs = SomeModel.objects.filter(slug=slug)
                if obj_qs.exists():
                    content_obj = obj_qs.first()
                    queryset_list = Comment.objects.filter_by_instance(content_obj)
        else:
            queryset_list = Comment.objects.filter(id__gte=0)  # filter(user=self.request.user)

        if query:
            queryset_list = queryset_list.filter(
                Q(content__icontains=query) |
                Q(user__first_name__icontains=query) |
                Q(user__last_name__icontains=query)
            ).distinct()
        return queryset_list
