from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'stock', 'image']

    def get_image(self, obj):
        if obj.image:
            # ส่งแค่ชื่อไฟล์
            return obj.image.name.split('/')[-1]
        return None