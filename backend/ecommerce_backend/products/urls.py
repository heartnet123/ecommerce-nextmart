from django.urls import path
from .views import *

urlpatterns = [
    path('', ProductListAPIView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('admin/', AdminCRUDProduct.as_view(), name='admin-product-list-create'),
    path('admin/<int:pk>/', AdminCRUDProduct.as_view(), name='admin-product-detail'),
    path('search/', ProductSearchAPIView.as_view(), name='search-products'),
    path('<int:product_id>/reviews/', ProductReviewsAPIView.as_view(), name='product-reviews'),
    path('<int:product_id>/can-review/', CanReviewProductAPIView.as_view(), name='can-review-product'),
    path('reviewable-products/', ReviewableProductsAPIView.as_view(), name='reviewable-products'),

]
