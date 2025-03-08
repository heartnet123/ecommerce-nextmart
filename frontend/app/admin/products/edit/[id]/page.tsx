"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter, useParams } from "next/navigation"; 

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
};

export default function EditProductPage() {
  const [form, setForm] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const params = useParams(); 
  const id = params.id as string; // ดึง id จาก params

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/products/${id}/`, {
          headers: { Authorization: `Bearer ${document.cookie.split("accessToken=")[1]?.split(";")[0]}` },
        });
        setForm(response.data);
      } catch (error) {
        toast.error("Failed to load product");
        console.error(error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "image") {
      setImageFile(e.target.files?.[0] || null);
    } else if (form) {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name || !form?.price || !form?.stock || !form?.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price.toString());
    formData.append("category", form.category);
    formData.append("stock", form.stock.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await axios.put(`http://localhost:8000/api/products/admin/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${document.cookie.split("accessToken=")[1]?.split(";")[0]}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <Input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
        <Input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <Input name="category" placeholder="Category (physical/digital)" value={form.category} onChange={handleChange} required />
        <Input name="image" type="file" accept="image/*" onChange={handleChange} />
        {form.image && <p>Current Image: {form.image}</p>}
        <Button type="submit">Update Product</Button>
      </form>
    </div>
  );
}