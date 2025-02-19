# Create your models here.
from django.db import models

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

    def __str__(self):
        return self.name
