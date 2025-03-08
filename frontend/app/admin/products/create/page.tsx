"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "image" && e.target.files) {
      const file = e.target.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }

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
      const token = document.cookie.split("accessToken=")[1]?.split(";")[0];
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
      toast.success("Product created successfully");
      console.log("Response:", response.data); // Debug
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <Input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
        <Input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <Input name="category" placeholder="Category (physical/digital)" value={form.category} onChange={handleChange} required />
        <Input name="image" type="file" accept="image/*" onChange={handleChange} />
        {imagePreview && (
          <Image src={imagePreview} alt="Preview" width={200} height={200} className="mt-2 object-cover" />
        )}
        <Button type="submit">Create Product</Button>
      </form>
    </div>
  );
}