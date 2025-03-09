"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("กรุณาให้คะแนนสินค้า");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถรีวิวสินค้า");
        return;
      }
      
      await axios.post(
        `http://127.0.0.1:8000/api/products/${productId}/reviews/`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      toast.success("ขอบคุณสำหรับรีวิวของคุณ");
      setRating(0);
      setComment("");
      onSuccess();
      
    } catch (error: any) {
      console.error("Error submitting review:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("ไม่สามารถส่งรีวิวได้ โปรดลองอีกครั้งในภายหลัง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium mb-4">เขียนรีวิวของคุณ</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">ให้คะแนน</label>
        <StarRating 
          rating={rating} 
          interactive={true}
          onRatingChange={setRating}
          size="lg"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium">ความคิดเห็นของคุณ</label>
        <Textarea
          id="comment"
          placeholder="แชร์ประสบการณ์การใช้งานสินค้านี้..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังส่งรีวิว...
          </>
        ) : (
          'ส่งรีวิว'
        )}
      </Button>
    </form>
  );
}