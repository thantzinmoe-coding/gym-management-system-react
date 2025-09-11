import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { feedbackService } from '@/services/feedbackService';
interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  title: string;
  review: string;
  verified: boolean;
  trainerName?: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // 1. Fetch paginated reviews
        const response = await feedbackService.listFeedbacks(0, 10);
        const reviewDtos = response.data; // depends on how ApiResponse is wrapped

        console.log('Fetched review DTOs:', reviewDtos);

        // 2. Transform backend response into Review[]
        const mappedReviews: Review[] = reviewDtos.map((f: any) => ({
          id: f.id,
          name: f.member?.name || 'Anonymous',
          rating: f.ratingPoints,
          date: f.createdAt,
          title: f.title || 'Member Review',
          review: f.comment,
          verified: true,
          trainerName: f.trainerName // backend doesn’t send, so assume true
        }));

        setReviews(mappedReviews);

        // 3. Fetch average rating for trainer (example trainerId = 1)
        const avgResponse = await feedbackService.getAverageRatingForTrainer(1);
        const avgData = avgResponse.data; // check actual structure

        const reviewStats: ReviewStats = {
          totalReviews: avgData.totalReviews || 0,
          averageRating: avgData.averageRating || 0,
          ratingBreakdown: avgData.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };


        setStats(reviewStats);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-600'
          }`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Member Reviews</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what our members have to say about their fitness journey at FitGym.
            Real reviews from real people who've transformed their lives.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading reviews...</p>
          </div>
        ) : (
          <>
            {/* Review Statistics */}

            {/* Reviews Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{review.name}</h3>
                      {review.verified && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Verified Member
                        </span>
                      )}
                      {/* ✅ Show trainer name */}
                      {review.trainerName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Trainer: {review.trainerName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(review.date)}
                      </p>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{review.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{review.review}</p>
                </Card>

              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mb-12">
              <Button variant="outline">
                Load More Reviews
              </Button>
            </div>

            {/* CTA Section */}
            <Card className="p-12 text-center bg-muted">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join hundreds of satisfied members who have transformed their lives at FitGym.
                Your success story could be next!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Join Now
                </Button>
                <Button variant="outline" size="lg">
                  Schedule Tour
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Reviews;