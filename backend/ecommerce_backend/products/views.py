from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

class ProductListAPIView(APIView):
    def get(self, request):
        products = Product.objects.all().order_by('id')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminCRUDProduct(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        """Create a new product with image upload"""
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            response_data = serializer.data
            if product.image:
                response_data['image'] = request.build_absolute_uri(product.image.url)
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class ProductSearchAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # ดึงค่าพารามิเตอร์จาก URL
        query = request.query_params.get('q', '')
        category = request.query_params.get('category', '')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        # เริ่มจาก QuerySet ทั้งหมด
        queryset = Product.objects.all()
        
        # กรองด้วย Q objects สำหรับค้นหา
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query)
            )
        
        # กรองตามหมวดหมู่
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        
        # กรองตามราคาต่ำสุด
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid min_price value"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # กรองตามราคาสูงสุด
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid max_price value"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Serialize ข้อมูล
        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data)