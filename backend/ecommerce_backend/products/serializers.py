from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'stock', 'image']

    def get_image(self, obj):
        if obj.image:
            return obj.image.name.split('/')[-1]
        return None 
    def validate_category(self, value):
        if value not in dict(Product.CATEGORY_CHOICES):
            raise serializers.ValidationError("Invalid category")
        return value

    def create(self, validated_data):
        # บันทึกข้อมูลและไฟล์
        product = Product(**validated_data)
        product.save()
        return product

    def update(self, instance, validated_data):
        # อัปเดตข้อมูลและไฟล์
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    