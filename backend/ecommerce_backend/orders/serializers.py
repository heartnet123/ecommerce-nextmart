# backend/app/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, Product
from django.db import transaction

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    cartItems = OrderItemSerializer(source='orderitem_set', many=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'cartItems', 'total_price', 'status', 'created_at']
        read_only_fields = ['user']  # ทำให้ user เป็น read-only

    def validate(self, data):
        """ตรวจสอบ stock ก่อนสร้างหรืออัปเดต"""
        cart_items = self.initial_data.get('cartItems', [])
        for item_data in cart_items:
            product = Product.objects.get(id=item_data['product'])
            if product.stock < item_data['quantity']:
                raise serializers.ValidationError(f"Not enough stock for {product.name}")
        return data

    def create(self, validated_data):
        """สร้าง Order และ OrderItem พร้อมคำนวณ total_price"""
        items_data = validated_data.pop('orderitem_set')
        user = self.context['request'].user  # ดึง user จาก context
        with transaction.atomic():
            order = Order.objects.create(user=user, **validated_data)
            total_price = 0
            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']
                OrderItem.objects.create(order=order, product=product, quantity=quantity)
                total_price += product.price * quantity
            order.total_price = total_price
            order.save()
            if order.status == 'completed':
                order.update_stock()
        return order