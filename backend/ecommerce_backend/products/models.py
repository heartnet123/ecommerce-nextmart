# Create your models here.
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('physical', 'Physical Product'),
        ('digital', 'Digital Product'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name
     # เพิ่มฟิลด์สำหรับคะแนนเฉลี่ย
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)

    # เพิ่มเมธอดอัพเดตคะแนนเฉลี่ยของสินค้า
    def update_rating(self):
        reviews = self.reviews.all()
        if reviews:
            avg = sum(review.rating for review in reviews) / reviews.count()
            self.average_rating = round(avg, 2)
            self.review_count = reviews.count()
        else:
            self.average_rating = 0
            self.review_count = 0
        self.save(update_fields=['average_rating', 'review_count'])

class Review(models.Model):
    RATING_CHOICES = [(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')]
    
    # แก้ไขจาก User เป็น settings.AUTH_USER_MODEL
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ใช้ AUTH_USER_MODEL จาก settings
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    # ใช้การอ้างอิงแบบ lazy โดยใช้สตริง เพื่อแก้ circular import
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, related_name='reviews')
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    helpful_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        # ป้องกันการรีวิวซ้ำ
        unique_together = ('user', 'product')
    
    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # อัพเดทคะแนนเฉลี่ยของสินค้า
        self.product.update_rating()