"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, Trash2, Loader2 } from "lucide-react";

export default function CreateProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
    if (errors.category) {
      setErrors({...errors, category: ''});
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("รูปภาพต้องมีขนาดไม่เกิน 5MB");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      if (errors.image) {
        setErrors({...errors, image: ''});
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = "ชื่อสินค้าจำเป็นต้องกรอก";
    if (!form.price) newErrors.price = "ราคาจำเป็นต้องกรอก";
    if (form.price && isNaN(Number(form.price))) newErrors.price = "ราคาต้องเป็นตัวเลขเท่านั้น";
    if (!form.stock) newErrors.stock = "จำนวนสินค้าจำเป็นต้องกรอก";
    if (form.stock && isNaN(Number(form.stock))) newErrors.stock = "จำนวนสินค้าต้องเป็นตัวเลขเท่านั้น";
    if (!form.category) newErrors.category = "หมวดหมู่จำเป็นต้องเลือก";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // Try getting token from localStorage first, then fall back to cookies
      let token = localStorage.getItem("accessToken");
      
      if (!token) {
        token = document.cookie.split("accessToken=")[1]?.split(";")[0];
      }
      
      if (!token) {
        toast.error("คุณไม่ได้เข้าสู่ระบบ");
        router.push("/login");
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/products/admin/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      toast.success("เพิ่มสินค้าสำเร็จ");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
        router.push("/login");
      } else {
        toast.error("ไม่สามารถเพิ่มสินค้าได้ โปรดลองอีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4 p-0 hover:bg-transparent"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">เพิ่มสินค้าใหม่</h1>
            <p className="text-muted-foreground mt-1">กรอกรายละเอียดสินค้าให้ครบถ้วนเพื่อเพิ่มสินค้าใหม่ลงในระบบ</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>ข้อมูลสินค้า</CardTitle>
              <CardDescription>กรอกข้อมูลสินค้าที่คุณต้องการเพิ่ม</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="font-medium">ข้อมูลพื้นฐาน</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อสินค้า <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="กรอกชื่อสินค้า" 
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">รายละเอียดสินค้า</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="กรอกรายละเอียดสินค้า"
                    value={form.description}
                    onChange={handleChange}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">ราคา (บาท) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="price" 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={form.price} 
                      onChange={handleChange}
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">จำนวนสินค้า <span className="text-red-500">*</span></Label>
                    <Input 
                      id="stock" 
                      name="stock" 
                      type="number" 
                      placeholder="0" 
                      value={form.stock} 
                      onChange={handleChange}
                      className={errors.stock ? "border-red-500" : ""}
                    />
                    {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Category Section */}
              <div className="space-y-4">
                <h3 className="font-medium">หมวดหมู่</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="category">หมวดหมู่สินค้า <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="เลือกหมวดหมู่สินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">สินค้าทั่วไป (Physical)</SelectItem>
                      <SelectItem value="digital">สินค้าดิจิทัล (Digital)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>

              <Separator />

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="font-medium">รูปภาพสินค้า</h3>
                
                <div className="space-y-3">
                  <Label htmlFor="image">อัพโหลดรูปภาพ</Label>
                  
                  {!imagePreview ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label 
                        htmlFor="image" 
                        className="flex flex-col items-center justify-center cursor-pointer py-4"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="font-medium block mb-1">Click to upload</span>
                        <span className="text-sm text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </span>
                      </Label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="aspect-video max-h-[300px] overflow-hidden rounded-md border bg-muted">
                        <Image 
                          src={imagePreview} 
                          alt="Product preview" 
                          fill 
                          className="object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    อัพโหลดภาพหลักสำหรับสินค้า
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'เพิ่มสินค้า'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}