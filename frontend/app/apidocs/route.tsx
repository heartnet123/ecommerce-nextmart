// app/reference/route.ts
import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  spec: {
    // ชี้ไปที่ URL ของ Django API schema
    url: 'http://localhost:8000/api/schema/',
  },
  // เพิ่มตัวเลือกเพื่อการแสดงผลที่ดีขึ้น
  theme: {
    // สามารถปรับแต่งสีและรูปแบบได้ตามต้องการ
    colors: {
      primary: {
        main: '#007FFF',
      },
    },
  },
}

export const GET = ApiReference(config)