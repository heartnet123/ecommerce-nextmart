from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Review
from .serializers import ProductSerializer, ReviewSerializer, ReviewCreateSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from orders.models import Order, OrderItem

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
        
        # กรองตามหมวดหมู่ (ใช้ choices ของ CharField)
        if category:
            queryset = queryset.filter(category=category)
        
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
    

class ProductReviewsAPIView(APIView):
    """API สำหรับดูและสร้างรีวิวของสินค้า"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request, product_id):
        """ดึงรายการรีวิวทั้งหมดของสินค้า"""
        product = get_object_or_404(Product, id=product_id)
        reviews = Review.objects.filter(product=product)
        
        # ถ้ามีพารามิเตอร์ limit ใส่เข้ามา
        limit = request.query_params.get('limit')
        if limit and limit.isdigit():
            reviews = reviews[:int(limit)]
        
        serializer = ReviewSerializer(reviews, many=True)
        
        # ข้อมูลสรุป
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[i] = reviews.filter(rating=i).count()
        
        return Response({
            'reviews': serializer.data,
            'count': reviews.count(),
            'average_rating': round(avg_rating, 2),
            'rating_distribution': rating_distribution
        })
    
    def post(self, request, product_id):
        """สร้างรีวิวใหม่ (ตรวจสอบว่าผู้ใช้ซื้อสินค้าแล้ว)"""
        user = request.user
        product = get_object_or_404(Product, id=product_id)
        
        # ตรวจสอบว่าผู้ใช้ซื้อสินค้านี้หรือไม่
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status='Delivered',  # สินค้าต้องถูกส่งแล้ว
            product=product
        ).exists()
        
        if not has_purchased:
            return Response(
                {"error": "คุณสามารถรีวิวได้เฉพาะสินค้าที่คุณซื้อแล้วเท่านั้น"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # ตรวจสอบว่าเคยรีวิวหรือยัง
        if Review.objects.filter(user=user, product=product).exists():
            return Response(
                {"error": "คุณได้รีวิวสินค้านี้ไปแล้ว"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # หา order ล่าสุดที่ซื้อสินค้านี้
        order_item = OrderItem.objects.filter(
            order__user=user,
            order__status='Delivered',
            product=product
        ).order_by('-order__created_at').first()
        
        # สร้างรีวิว
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(
                user=user, 
                product=product,
                order=order_item.order if order_item else None
            )
            
            # ส่งข้อมูลรีวิวกลับไป
            return_serializer = ReviewSerializer(review)
            return Response(return_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CanReviewProductAPIView(APIView):
    """ตรวจสอบว่าผู้ใช้สามารถรีวิวสินค้านี้ได้หรือไม่"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, product_id):
        user = request.user
        product = get_object_or_404(Product, id=product_id)
        
        # ตรวจสอบว่าซื้อสินค้านี้หรือยัง
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status='Delivered',
            product=product
        ).exists()
        
        # ตรวจสอบว่าเคยรีวิวหรือยัง
        has_reviewed = Review.objects.filter(
            user=user, 
            product=product
        ).exists()
        
        can_review = has_purchased and not has_reviewed
        
        return Response({
            'can_review': can_review,
            'has_purchased': has_purchased,
            'has_reviewed': has_reviewed
        })

class ReviewableProductsAPIView(APIView):
    """รายการสินค้าที่ผู้ใช้สามารถรีวิวได้"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # สินค้าที่ซื้อและจัดส่งแล้ว
        purchased_products_ids = OrderItem.objects.filter(
            order__user=user,
            order__status='Delivered'
        ).values_list('product_id', flat=True).distinct()
        
        # สินค้าที่เคยรีวิวแล้ว
        reviewed_products_ids = Review.objects.filter(
            user=user
        ).values_list('product_id', flat=True)
        
        # สินค้าที่สามารถรีวิวได้
        reviewable_products = Product.objects.filter(
            id__in=purchased_products_ids
        ).exclude(
            id__in=reviewed_products_ids
        )
        
        # ประกอบข้อมูลพื้นฐาน
        products_data = []
        for product in reviewable_products:
            products_data.append({
                'id': product.id,
                'name': product.name,
                'image': request.build_absolute_uri(product.image.url) if product.image else None
            })
        
        return Response({
            'count': len(products_data),
            'products': products_data
        })