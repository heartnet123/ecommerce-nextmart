"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
import { Truck, CreditCard, ClipboardList } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  
  // Multi-step checkout states
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: ""
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [saveInfo, setSaveInfo] = useState(false);

  // Fetch user profile when page loads
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = document.cookie.split("accessToken=")[1]?.split(";")[0];
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อน");
          router.push("/login");
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserId(response.data.id);
        
        // If user has saved address, populate it
        if (response.data.address) {
          setShippingAddress({
            fullName: response.data.fullName || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            city: response.data.city || "",
            postalCode: response.data.postalCode || "",
            province: response.data.province || ""
          });
        }
      } catch (error: any) {
        toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
        console.error("Profile fetch error:", error.response?.data || error.message);
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, [router]);

  const isFormValid = () => {
    const { fullName, phone, address, city, postalCode, province } = shippingAddress;
    
    if (step === 1) {
      return fullName && phone && address && city && postalCode && province;
    }
    
    return true;
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    setStep(2);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("ตะกร้าสินค้าว่างเปล่า");
      return;
    }
    if (!userId) {
      toast.error("ไม่ได้เข้าสู่ระบบ");
      return;
    }

    setLoading(true);
    
    // คำนวณค่าจัดส่ง
    const shippingCost = shippingMethod === "standard" ? 0 : (shippingMethod === "express" ? 100 : 250);
    
    const orderData = {
      cartItems: cartItems.map((item) => ({
        product: parseInt(item.id),
        quantity: item.quantity,
      })),
      shipping_address: `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}, Tel: ${shippingAddress.phone}`,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      total_price: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingCost,
      status: "pending",
    };

    try {
      const token = document.cookie.split("accessToken=")[1]?.split(";")[0];
      if (!token) throw new Error("ไม่พบตั๋วผ่าน (token)");

      if (saveInfo) {
        await axios.put(
          `http://127.0.0.1:8000/api/auth/update-profile/`,
          {
            address: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            province: shippingAddress.province,
            phone: shippingAddress.phone,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/orders/create/`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("สั่งซื้อสินค้าสำเร็จ");
      clearCart();
      router.push("/profile");
    } catch (error: any) {
      toast.error("ไม่สามารถสั่งซื้อสินค้าได้");
      console.error("Order submission error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userId === null && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">ตะกร้าสินค้าของคุณว่างเปล่า</h2>
          <p className="mb-6 text-gray-500">เพิ่มสินค้าในตะกร้าเพื่อทำการสั่งซื้อ</p>
          <Button onClick={() => router.push('/products')}>
            เลือกซื้อสินค้า
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ชำระเงิน</h1>
      
      {/* Checkout Steps */}
      <div className="flex justify-between mb-8">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-gray-600 text-white' : 'bg-muted'}`}>
            <Truck size={20} />
          </div>
          <span className="text-sm">ข้อมูลจัดส่ง</span>
        </div>
        <div className="flex-1 border-t border-gray-300 self-center mx-2"></div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-gray-600 text-white' : 'bg-muted'}`}>
            <CreditCard size={20} />
          </div>
          <span className="text-sm">การชำระเงิน</span>
        </div>
        <div className="flex-1 border-t border-gray-300 self-center mx-2"></div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-gray-400 text-white' : 'bg-muted'}`}>
            <ClipboardList size={20} />
          </div>
          <span className="text-sm">ตรวจสอบและยืนยัน</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="md:col-span-2 bg-background p-6 rounded-lg shadow-sm">
          {/* Step 1: Shipping information */}
          {step === 1 && (
            <form onSubmit={handleSubmitAddress}>
              <h2 className="text-xl font-semibold mb-4">ข้อมูลการจัดส่ง</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                    <Input 
                      id="fullName" 
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input 
                      id="phone" 
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Textarea 
                    id="address" 
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">อำเภอ/เขต</Label>
                    <Input 
                      id="city" 
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">จังหวัด</Label>
                    <Input 
                      id="province" 
                      value={shippingAddress.province}
                      onChange={(e) => setShippingAddress({...shippingAddress, province: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                    <Input 
                      id="postalCode" 
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>วิธีการจัดส่ง</Label>
                  <RadioGroup 
                    value={shippingMethod} 
                    onValueChange={setShippingMethod}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1">มาตรฐาน (3-5 วัน) - ฟรี</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1">ด่วน (1-2 วัน) - 100 บาท</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value="same-day" id="same-day" />
                      <Label htmlFor="same-day" className="flex-1">ด่วนพิเศษ (วันเดียวกัน) - 250 บาท</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={!isFormValid()}>
                  ถัดไป
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Payment method */}
          {step === 2 && (
            <form onSubmit={handleSubmitPayment}>
              <h2 className="text-xl font-semibold mb-4">วิธีการชำระเงิน</h2>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1">เก็บเงินปลายทาง</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                  <Label htmlFor="bank-transfer" className="flex-1">โอนเงินผ่านธนาคาร</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex-1">บัตรเครดิต/เดบิต</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="prompt-pay" id="prompt-pay" />
                  <Label htmlFor="prompt-pay" className="flex-1">พร้อมเพย์</Label>
                </div>
              </RadioGroup>

              <div className="flex items-center mt-6">
                <input 
                  type="checkbox" 
                  id="saveInfo" 
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <Label htmlFor="saveInfo">บันทึกข้อมูลสำหรับการสั่งซื้อครั้งต่อไป</Label>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  กลับ
                </Button>
                <Button type="submit">
                  ถัดไป
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Review order */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">ตรวจสอบคำสั่งซื้อ</h2>
              
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">ข้อมูลการจัดส่ง</h3>
                  <p>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
                  <p>โทร: {shippingAddress.phone}</p>
                  <p className="mt-2 font-medium">
                    วิธีจัดส่ง: {
                      shippingMethod === "standard" ? "มาตรฐาน (3-5 วัน)" : 
                      shippingMethod === "express" ? "ด่วน (1-2 วัน)" : 
                      "ด่วนพิเศษ (วันเดียวกัน)"
                    }
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">วิธีชำระเงิน</h3>
                  <p>{
                    paymentMethod === "cod" ? "เก็บเงินปลายทาง" :
                    paymentMethod === "bank-transfer" ? "โอนเงินผ่านธนาคาร" :
                    paymentMethod === "credit-card" ? "บัตรเครดิต/เดบิต" :
                    "พร้อมเพย์"
                  }</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">รายการสินค้า</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between pb-3 border-b"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-background rounded-md overflow-hidden relative mr-3">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">{(item.price * item.quantity)} ฿</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  กลับ
                </Button>
                <Button 
                  onClick={handleConfirmOrder} 
                  disabled={loading}
                >
                  {loading ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Order summary */}
        <div className="bg-background p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">สรุปคำสั่งซื้อ</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>ราคาสินค้า:</span>
              <span>{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)} ฿</span>
            </div>
            <div className="flex justify-between">
              <span>ค่าจัดส่ง:</span>
              <span>
                {shippingMethod === "standard" ? "ฟรี" : 
                 shippingMethod === "express" ? "100 ฿" : 
                 "250 ฿"}
              </span>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between font-bold">
              <span>ยอดรวม:</span>
              <span>
                {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 
                 (shippingMethod === "standard" ? 0 : (shippingMethod === "express" ? 100 : 250))} ฿
              </span>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium">รายการสินค้า ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น)</h3>
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="truncate max-w-[200px]">{item.name} x{item.quantity}</span>
                <span>{item.price * item.quantity} ฿</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}