![Logo](https://i.ibb.co/pvrv9xXn/output.png)
# NextMart - E-Commerce Project
โปรเจคพัฒนาระบบ E-Commerce ด้วย Next.js และ Django REST Framework
E-Commerce Project Subject Client-Side Development

### เทคโนโลยีที่ใช้
## Frontend
- Next.js 15+
- Tailwind CSS
- Zustand (State Management)
- Shadcn UI Components
## Backend
- Django 5.1.7
- Django REST Framework
- JWT Authentication
- SQLite (ฐานข้อมูล)

## Features

- 🌓 โหมดสว่าง/มืด
- 🔍 ค้นหาสินค้าด้วยคีย์เวิร์ด
- 🛒 ระบบตะกร้าสินค้า
- ⭐ ให้คะแนนและรีวิวสินค้า
- 📦 จัดการสินค้า (เพิ่ม/ลบ/แก้ไข) สำหรับผู้ดูแลระบบ
- 📮 จัดการคำสั่งซื้อและสถานะการจัดส่ง

## Setup
### Backend
```bash
python3 -m venv venv
venv/bin/activate
cd backend
pip install -r requirements.txt
cd ecommerce_backend
python manage.py migrate
python manage.py runserver
```
### Frontend
```bash
cd frontend
npm install
npm run dev
 ```   

## API Reference
### - For Easy to look in frontend -->> [Link]localhost:3000/apidocs

### ผู้ใช้งาน (Users)
| Method | Endpoint | Description |
| ------ | -------- | ----------- | 
| POST | /api/users/register/ | ลงทะเบียนผู้ใช้ใหม่ 
| GET | /api/users/profile/ | ดูข้อมูลผู้ใช้ 
| POST | /api/users/logout/ | ออกจากระบบ 
| GET | /api/users/is-admin/ | ตรวจสอบสถานะผู้ดูแลระบบ

### สินค้า (Products)
| Method | Endpoint | Description | 
| ------ | -------- | ----------- |
| GET | /api/products/ | ดูรายการสินค้าทั้งหมด
| GET | /api/products/{id}/ | ดูรายละเอียดสินค้า
| POST | /api/products/ | เพิ่มสินค้าใหม่
| PUT | /api/products/{id}/ | แก้ไขสินค้า 
| DELETE | /api/products/{id}/ | ลบสินค้า

### คำสั่งซื้อ (Orders)
| Method | Endpoint | Description | 
| ------ | -------- | ----------- |
| GET | /api/orders/ | ดูคำสั่งซื้อ (ของตัวเอง/ทั้งหมดสำหรับ admin)
| POST | /api/orders/ | สร้างคำสั่งซื้อใหม่
| GET | /api/orders/{id}/ | ดูรายละเอียดคำสั่งซื้อ 
| PUT | /api/orders/{id}/ | อัปเดตสถานะคำสั่งซื้อ 


