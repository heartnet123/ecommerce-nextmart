// app/products/[id]/page.tsx



import Image from "next/image";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import  ReviewForm from "@/app/components/products/ReviewForm";

type Review = {
  id: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
  };
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
};

type ReviewsResponse = {
  reviews: Review[];
  count: number;
  average_rating: number;
  rating_distribution: {
    [key: string]: number;
  };
};
type Props = {
  params: Promise<{ id: string }>; // Type params as a Promise
};

async function getProductReviews(productId: string): Promise<ReviewsResponse> {
  try {
    console.log(`Fetching reviews for product ${productId}`);
    const res = await fetch(`http://127.0.0.1:8000/api/products/${productId}/reviews/`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch reviews: ${res.status} ${res.statusText}`);
      return {
        reviews: [],
        count: 0,
        average_rating: 0,
        rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
      };
    }

    const data = await res.json();
    console.log('Reviews data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return {
      reviews: [],
      count: 0,
      average_rating: 0,
      rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    };
  }
}

async function ReviewsList({ productId }: { productId: string }) {
  const reviewData = await getProductReviews(productId);
  
  if (!reviewData.reviews || reviewData.reviews.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No reviews found</p>
      </div>
    );
  }

  return (
    <>
      {reviewData.reviews.map((review: Review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <div className="mr-2 flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </div>
              <span className="font-medium ml-2">{review.user.username}</span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-200 mt-2">{review.comment}</p>
        </div>
      ))}
    </>
  );
}


async function getProduct(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params; // Await params to get id
  const product = await getProduct(id);
  const reviewData = await getProductReviews(id);

  if (!product) {
    notFound();
  }
  const imageUrl = product.image
  ? `http://127.0.0.1:8000/${product.image}/`
  : "/products/placeholder.jpg";
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium mb-6">
        <a href="/" className="hover:text-primary transition-colors">Home</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary transition-colors">Products</a>
        <span className="mx-2">/</span>
        <span className="text-sm">{product.name}</span>
      </nav>
      
      <div className="bg-background rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="bg-gray-50 p-6 flex items-center justify-center">
            <div className="relative h-[500px] w-full max-w-[500px]">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain rounded-lg"
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-8 lg:pl-12 flex flex-col">
            <div className="mb-auto">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-background rounded-full mb-4 tracking-wide uppercase">
                {product.category}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                       key={star}
                       className={star <= Math.round(product.average_rating || 0) ? "text-yellow-400" : "text-gray-300"}
                   >
                     ★
                    </span>
              ))}
                  </div>
                  <span className="text-sm">({product.review_count || 0} reviews)</span>
                </div>
              
              <p className="mb-8 leading-relaxed">{product.description}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <span className="text-3xl font-bold">{product.price} ฿</span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${
                  product.stock > 10
                    ? "bg-background" 
                    : product.stock > 0 
                    ? "bg-background"
                    : "bg-background"
                }`}>
                  {product.stock > 10 
                    ? `${product.stock} in stock ` 
                    : product.stock > 0 
                    ? `${product.stock} in stock` 
                    : "Out of Stock"}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-4">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex rounded-md overflow-hidden border border-gray-300">
                    <button className="bg-background px-3 py-2 hover:bg-gray-200 transition-colors">-</button>
                    <div className="w-12 text-center py-2">1</div>
                    <button className="bg-background px-3 py-2 hover:bg-gray-200 transition-colors">+</button>
                  </div>
                  <span className="text-sm">
                    {product.stock} available
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 py-6 text-base font-semibold" 
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-6 text-base font-semibold"
                >
                  Buy Now
                </Button>
              </div>
              
              <div className="flex items-center gap-6 mt-6">
                <button className="flex items-center gap-2 hover: transition-colors">
                  <span className="h-5 w-5">♡</span>
                  <span>Add to wishlist</span>
                </button>
                <button className="flex items-center gap-2 hover: transition-colors">
                  <span className="h-5 w-5">↗</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full sm:w-auto flex rounded-lg bg-background p-1 mb-8">
            <TabsTrigger value="details" className="flex-1 sm:flex-none rounded-md data-[state=active]:bg-white-100 data-[state=active]:shadow-sm">
              Description
            </TabsTrigger>
            <TabsTrigger value="specs" className="flex-1 sm:flex-none rounded-md data-[state=active]:bg-white-100 data-[state=active]:shadow-sm">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 sm:flex-none rounded-md data-[state=active]:bg-white-100 data-[state=active]:shadow-sm">
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="pt-4">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="specs" className="pt-4">
            <div className="bg-background rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Category</span>
                  <span className="">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Stock</span>
                  <span className="">{product.stock} units</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Weight</span>
                  <span className="">0.5 kg</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Dimensions</span>
                  <span className="">10 × 10 × 10 cm</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Material</span>
                  <span className="">Premium</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">SKU</span>
                  <span className="">PRD-{product.id}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
  <div className="bg-background rounded-xl overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Rating Summary */}
      <div className="bg-background p-8 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-bold">{reviewData.average_rating ? product.average_rating : '0.0'}</span>
        <div className="flex text-xl my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= Math.round(reviewData.average_rating || 0) ? "text-yellow-400" : "text-gray-300"}>
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">Based on {reviewData.count || 0} reviews</p>

        <ReviewForm productId={product.id} />
      </div>
      
      {/* Reviews List */}
      <div className="md:col-span-2 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          <a href={`/products/${product.id}/review`}>
            <Button>
              Write a Review
            </Button>
          </a>
        </div>
        
        {(reviewData.count > 0) ? (
          <div className="space-y-6">
            <ReviewsList productId={product.id} />
          </div>
        ) : (
          <div className="bg-background rounded-lg p-8 text-center">
            <p className="mb-4">
              There are no reviews yet.
            </p>
            <a href={`/products/${product.id}/review`}>
              <Button>
                Be the first to review
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
</TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-background-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  Product {i}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Related Product {i}</h3>
                <p className="font-bold">99.00 ฿</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}