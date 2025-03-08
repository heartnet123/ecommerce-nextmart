from django.urls import path
from .views import ProductListAPIView, ProductDetailAPIView, AdminCRUDProduct, ProductSearchAPIView

urlpatterns = [
    path('', ProductListAPIView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('admin/', AdminCRUDProduct.as_view(), name='admin-product-list-create'),
    path('admin/<int:pk>/', AdminCRUDProduct.as_view(), name='admin-product-detail'),
    path('search/', ProductSearchAPIView.as_view(), name='search-products'),
]
