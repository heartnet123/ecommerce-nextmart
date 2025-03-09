"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import StarRating from "./StarRating";
import ReviewItem from "./ReviewList";
import ReviewForm from "./ReviewForm";

interface Review {
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
}

interface ReviewsData {
  reviews: Review[];
  count: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
}

interface ReviewTabProps {
  productId: string;
}

export default function ReviewTab({ productId }: ReviewTabProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/reviews/`);
      setReviewsData(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("ไม่สามารถโหลดรีวิวได้");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkCanReview = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        setIsAuthenticated(false);
        setCanReview(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/products/${productId}/can-review/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setCanReview(response.data.can_review);
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      setCanReview(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
    checkCanReview();
  }, [productId]);
  
  const handleReviewSuccess = () => {
    fetchReviews();
    checkCanReview();
    setShowReviewForm(false);
  };
  
  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.error("คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถเขียนรีวิว");
      return;
    }
    
    if (!canReview) {
      toast.error("คุณสามารถรีวิวได้เฉพาะสินค้าที่คุณซื้อแล้วเท่านั้น");
      return;
    }
    
    setShowReviewForm(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const averageRating = reviewsData?.average_rating || 0;
  const totalReviews = reviewsData?.count || 0;
  
  return (
    <div className="bg-background rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-muted/20 p-8 flex flex-col items-center justify-center text-center rounded-lg">
          <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="my-2">
            <StarRating rating={averageRating} size="md" />
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
          
          {reviewsData && reviewsData.rating_distribution && (
            <div className="w-full mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviewsData.rating_distribution[star] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center text-sm">
                    <span className="w-3">{star}</span>
                    <span className="ml-2">
                      <StarRating rating={1} maxRating={1} size="sm" />
                    </span>
                    <div className="flex-1 mx-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          
          {!showReviewForm && (
            <Button 
              onClick={handleWriteReviewClick}
              className="mt-6"
              variant={canReview ? "default" : "outline"}
            >
              เขียนรีวิว
            </Button>
          )}
        </div>
        
        <div className="md:col-span-2 p-8">
          <h3 className="text-xl font-semibold mb-6">รีวิวจากผู้ซื้อ</h3>
          
          {showReviewForm && canReview && (
            <div className="mb-8 p-6 border rounded-lg">
              <ReviewForm 
                productId={productId}
                onSuccess={handleReviewSuccess}
              />
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowReviewForm(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          )}
          
          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div className="space-y-0">
              {reviewsData.reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="bg-muted/20 rounded-lg p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                ยังไม่มีรีวิวสำหรับสินค้านี้
              </p>
              {!showReviewForm && canReview && (
                <Button onClick={() => setShowReviewForm(true)}>
                  เป็นคนแรกที่รีวิว
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}