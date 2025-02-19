from django.urls import path
from .views import ProductListAPIView, ProductDetailAPIView, AdminCRUDProduct

urlpatterns = [
    path('', ProductListAPIView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('admin/', AdminCRUDProduct.as_view(), name='admin-crud-product'),
    path('admin/<int:pk>/', AdminCRUDProduct.as_view(), name='admin-crud-product-detail'),
]
