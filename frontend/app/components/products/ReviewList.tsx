"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "./StarRating";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface ReviewItemProps {
  review: {
    id: number;
    user: {
      id: number;
      username: string;
      first_name?: string;
      last_name?: string;
    };
    user_name?: string;
    rating: number;
    comment: string;
    created_at: string;
    helpful_count: number;
  };
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  
  const displayName = review.user_name || 
    (review.user.first_name 
      ? `${review.user.first_name} ${review.user.last_name || ''}`.trim()
      : review.user.username);
      
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  const markHelpful = async () => {
    if (hasMarkedHelpful) return;
    
    try {
      setIsHelpfulLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        toast.error("คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถทำเครื่องหมายว่ารีวิวมีประโยชน์");
        return;
      }
      
      await axios.post(
        `http://127.0.0.1:8000/api/reviews/${review.id}/helpful/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setHelpfulCount(prev => prev + 1);
      setHasMarkedHelpful(true);
      
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      toast.error("ไม่สามารถทำเครื่องหมายได้ โปรดลองอีกครั้งในภายหลัง");
    } finally {
      setIsHelpfulLoading(false);
    }
  };
  
  return (
    <div className="pb-6 mb-6 border-b last:border-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{displayName}</p>
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {review.comment && (
        <p className="text-muted-foreground mb-4">{review.comment}</p>
      )}
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
          onClick={markHelpful}
          disabled={isHelpfulLoading || hasMarkedHelpful}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span className="text-xs">
            {helpfulCount > 0 ? `${helpfulCount} found this helpful` : "Mark as helpful"}
          </span>
        </Button>
      </div>
    </div>
  );
}