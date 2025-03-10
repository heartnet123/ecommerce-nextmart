# NextMart - E-Commerce Project
E-Commerce Project Subject Client-Side Development

![Logo](https://i.ibb.co/pvrv9xXn/output.png)

## Features

- Light/dark mode toggle
- 🔍 ค้นหาสินค้าด้วยคีย์เวิร์ด
- 🛒 ระบบตะกร้าสินค้า
- ⭐ ให้คะแนนและรีวิวสินค้า
- 📦 จัดการสินค้า (เพิ่ม/ลบ/แก้ไข)
- 📮 จัดการคำสั่งซื้อ

## Setup
### Backend
```bash
cd backend
python3 -m venv venv
venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### Frontend
```bash
cd frontend
npm install
npm run dev
 ```   
## Demo

Insert gif or link to demo

[![Watch the video](https://i.sstatic.net/Vp2cE.png)](https://www.youtube.com/watch?v=IGv9EPBvfCc)
## API Reference

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.


## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)
