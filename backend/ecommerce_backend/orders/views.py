from django.shortcuts import render

# Create your views here.
# backend/app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Order
from .serializers import OrderSerializer


class OrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk=None):
        """ดึงข้อมูลคำสั่งซื้อทั้งหมดหรือรายการเดียว"""
        user = request.user
        
        # If pk is provided, return a specific order (checking if it belongs to the user)
        if pk:
            try:
                # For regular users, only allow access to their own orders
                if not user.is_staff:
                    order = Order.objects.get(pk=pk, user=user)
                else:
                    # Admin users can access any order
                    order = Order.objects.get(pk=pk)
                    
                serializer = OrderSerializer(order)
                return Response(serializer.data)
            except Order.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # For listing all orders
        if user.is_staff:
            # Admin users can see all orders
            orders = Order.objects.all()
        else:
            # Regular users can only see their own orders
            orders = Order.objects.filter(user=user)
            
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # ไม่ต้องส่ง user= เพราะ serializer จัดการเอง
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminOrderView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk=None):
        """ดึงข้อมูลคำสั่งซื้อทั้งหมด"""
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def put(self, request, pk):
        """อัปเดตคำสั่งซื้อ (เช่น เปลี่ยนสถานะ)"""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)