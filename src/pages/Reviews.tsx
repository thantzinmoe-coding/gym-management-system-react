import { useState, useEffect } from 'react';
import {Navbar} from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  title: string;
  review: string;
  verified: boolean;
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
    // Simulating API call to fetch reviews
    const fetchReviews = async () => {
      const mockReviews: Review[] = [
        {
          id: 1,
          name: "Jennifer Smith",
          rating: 5,
          date: "2024-01-15",
          title: "Amazing transformation!",
          review: "I've been a member for 6 months and the results speak for themselves. The trainers are knowledgeable and supportive, and the equipment is top-notch. Couldn't be happier with my decision to join FitGym.",
          verified: true
        },
        {
          id: 2,
          name: "David Wilson",
          rating: 5,
          date: "2024-01-10",
          title: "Best gym in the city",
          review: "Clean facilities, friendly staff, and great atmosphere. The variety of classes keeps my workouts interesting. The personal training sessions have been incredibly helpful in reaching my fitness goals.",
          verified: true
        },
        {
          id: 3,
          name: "Maria Garcia",
          rating: 4,
          date: "2024-01-08",
          title: "Great community feel",
          review: "What I love most about FitGym is the community. Everyone is so supportive and encouraging. The group classes are fun and challenging. My only minor complaint is that it can get busy during peak hours.",
          verified: true
        },
        {
          id: 4,
          name: "Robert Johnson",
          rating: 5,
          date: "2024-01-05",
          title: "Exceeded expectations",
          review: "I was hesitant to join a gym, but FitGym made me feel welcome from day one. The staff took time to show me around and explain all the equipment. Three months in and I'm stronger than ever!",
          verified: true
        },
        {
          id: 5,
          name: "Emily Chen",
          rating: 4,
          date: "2024-01-03",
          title: "Love the yoga classes",
          review: "The yoga instructor Lisa is fantastic! Her classes have helped improve my flexibility and reduce stress. The studio is peaceful and well-maintained. Highly recommend the morning sessions.",
          verified: true
        },
        {
          id: 6,
          name: "Michael Brown",
          rating: 5,
          date: "2024-01-01",
          title: "Life-changing experience",
          review: "FitGym has completely changed my approach to fitness. The personal trainers created a program that actually works for my lifestyle. I've lost 30 pounds and gained so much confidence!",
          verified: true
        }
      ];

      const mockStats: ReviewStats = {
        totalReviews: 247,
        averageRating: 4.7,
        ratingBreakdown: {
          5: 178,
          4: 52,
          3: 12,
          2: 3,
          1: 2
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1500));
      setReviews(mockReviews);
      setStats(mockStats);
      setIsLoading(false);
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-600'
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
            {stats && (
              <Card className="p-8 mb-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      <span className="text-4xl font-bold mr-2">{stats.averageRating}</span>
                      <div>
                        <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                        <p className="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Based on {stats.totalReviews} verified member reviews
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Rating Breakdown</h3>
                    {Object.entries(stats.ratingBreakdown)
                      .sort(([a], [b]) => parseInt(b) - parseInt(a))
                      .map(([rating, count]) => (
                        <div key={rating} className="flex items-center mb-2">
                          <span className="w-8 text-sm">{rating}★</span>
                          <div className="flex-1 bg-muted rounded-full h-2 mx-3">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(count / stats.totalReviews) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            )}

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