import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Send, ThumbsUp, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trainerService } from '@/services/trainerService';
import { feedbackService } from '@/services/feedbackService';
import { authService } from '@/services/authService';

interface Trainer {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
}

interface FeedbackHistory {
    id: string;
    trainerName: string;
    ratingPoints: number;
    feedback: string;
    date: string;
    type: 'trainer';
}

export default function GiveFeedback() {
    const { toast } = useToast();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([]);
    const user = authService.getCurrentUser();
    const userId = user?.id;

    const renderStars = (currentRating: number, interactive = false) => (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    className={`h-5 w-5 cursor-pointer transition-colors ${star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                    onClick={() => interactive && setRating(star)}
                />
            ))}
        </div>
    );

    const handleSubmitFeedback = async (e: any) => {
        e.preventDefault();
        if (!selectedTrainer || !rating || !feedback.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {

            console.log('Submitting feedback with data:', {
                comment: feedback,
                ratingPoints: rating,
                member_id: userId,
                trainer_id: selectedTrainer,
            });

            const response = await feedbackService.giveFeedback({
                comment: feedback,
                ratingPoints: rating,
                member_id: userId,
                trainer_id: selectedTrainer,
            });

            console.log('Feedback submission response:', response);
            toast({
                title: "Feedback Submitted",
                description: "Thank you for your feedback! It helps us improve our services.",
                variant: "default",
            });

            const newFeedback: FeedbackHistory = {
                id: (feedbackHistory.length + 1).toString(),
                trainerName: trainers.find(trainer => trainer.id === Number(selectedTrainer))?.name || "Unknown Trainer",
                ratingPoints: rating, //changed rating to ratingPoints
                feedback,
                date: new Date().toISOString().split('T')[0],
                type: 'trainer'
            };

            setFeedbackHistory([newFeedback, ...feedbackHistory]);
            setSelectedTrainer('');
            setRating(0);
            setFeedback('');

        } catch (error: any) {
            console.error('Error submitting feedback:', error);
            toast({
                title: "Error",
                description: "Failed to submit feedback.",
                variant: "destructive",
            });
        }
    };

   useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await trainerService.getAllTrainers();
        if (data && data.data) {
          setTrainers(data.data);
        } else {
          console.error("Unexpected data structure:", data);
          toast({
            title: "Error fetching trainers",
            description: "Unexpected data format from the server.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch trainers:", error);
        toast({
          title: "Error fetching trainers",
          description: "Failed to connect to the server.",
          variant: "destructive",
        });
      }
    };

    fetchTrainers();
  }, [toast]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Give Feedback</h1>
                <p className="text-muted-foreground">Share your experience with your trainer</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Submit Trainer Feedback
                        </CardTitle>
                        <CardDescription>Help us improve by sharing your trainer experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Trainer</label>
                            <Select value={selectedTrainer} onValueChange={(value) => {
                                console.log("Selected Trainer ID:", value);
                                setSelectedTrainer(value);
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select trainer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trainers.map((trainer: Trainer) => (
                                        <SelectItem key={trainer.id} value={String(trainer.id)}>
                                            {trainer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Rating</label>
                            <div className="flex items-center space-x-2">
                                {renderStars(rating, true)}
                                <span className="text-sm text-muted-foreground ml-2">
                                    {rating > 0 ? `${rating}/5 stars` : 'Click to rate'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Feedback</label>
                            <Textarea
                                placeholder="Share your detailed feedback here..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button onClick={handleSubmitFeedback} className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Submit Feedback
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ThumbsUp className="h-5 w-5 mr-2" />
                            My Trainer Feedback
                        </CardTitle>
                        <CardDescription>View your previously submitted trainer feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {feedbackHistory.length > 0 ? (
                                feedbackHistory.map(item => (
                                    <div key={item.id} className="p-4 bg-muted/50 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-foreground">{item.trainerName}</h4>
                                            </div>
                                            <Badge variant="default">Trainer</Badge>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-2">
                                            {renderStars(item.ratingPoints)}
                                            <span className="text-sm text-muted-foreground">({item.ratingPoints}/5)</span>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2">{item.feedback}</p>

                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>Submitted on {item.date}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No trainer feedback yet</p>
                                    <p className="text-sm text-muted-foreground">Submit your first feedback to see it here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}