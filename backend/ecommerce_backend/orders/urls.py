# backend/app/urls.py
from django.urls import path
from .views import OrderCreateView, AdminOrderView,OrderView

urlpatterns = [
    path('', OrderView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('admin/', AdminOrderView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderView.as_view(), name='admin-order-detail'),
]