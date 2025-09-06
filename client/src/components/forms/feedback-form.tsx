import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Star, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

const feedbackSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  rating: z.number().min(1, "Please provide a rating").max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  events: Event[];
  selectedEventId?: string | null;
  onEventSelect?: (eventId: string) => void;
  onSuccess: () => void;
}

export default function FeedbackForm({ events, selectedEventId, onEventSelect, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      eventId: selectedEventId || "",
      rating: 0,
      comment: "",
    },
  });

  const watchedRating = form.watch("rating");
  const watchedEventId = form.watch("eventId");

  // Update form when selectedEventId changes
  if (selectedEventId && selectedEventId !== watchedEventId) {
    form.setValue("eventId", selectedEventId);
  }

  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await apiRequest("POST", `/api/events/${data.eventId}/feedback`, {
        rating: data.rating,
        comment: data.comment || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. It helps us improve future events.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitMutation.mutate(data);
  };

  const handleStarClick = (rating: number) => {
    form.setValue("rating", rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(null);
  };

  const selectedEvent = events.find(e => e.id === watchedEventId);
  const progressPercentage = ((Object.keys(form.formState.dirtyFields).length + (watchedRating > 0 ? 1 : 0)) / 3) * 100;

  if (events.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-feedback-events">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No events available for feedback</p>
        <p className="text-sm text-muted-foreground mt-2">
          Attend events to provide feedback and help improve future experiences
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Feedback Progress</h3>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Selection */}
        <div className="space-y-2">
          <Label htmlFor="event">Select Event *</Label>
          <Select 
            value={watchedEventId}
            onValueChange={(value) => {
              form.setValue("eventId", value);
              if (onEventSelect) {
                onEventSelect(value);
              }
            }}
          >
            <SelectTrigger className="bg-input border-border focus:border-primary" data-testid="select-feedback-event">
              <SelectValue placeholder="Choose an event to review" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.eventId && (
            <p className="text-destructive text-sm">{form.formState.errors.eventId.message}</p>
          )}
        </div>

        {/* Event Details Preview */}
        {selectedEvent && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-1" data-testid="selected-event-title">
              {selectedEvent.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-2" data-testid="selected-event-date">
              {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {selectedEvent.description}
            </p>
          </div>
        )}

        {/* Rating */}
        <div className="space-y-3">
          <Label>Your Rating *</Label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = (hoveredStar !== null ? hoveredStar : watchedRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl transition-colors ${
                    isActive ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-400"
                  }`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  data-testid={`star-${star}`}
                >
                  <Star className={`h-8 w-8 ${isActive ? "fill-current" : ""}`} />
                </button>
              );
            })}
            <span className="ml-4 text-sm text-muted-foreground">
              {watchedRating > 0 ? (
                <>
                  {watchedRating}/5 - {
                    watchedRating === 1 ? "Poor" :
                    watchedRating === 2 ? "Fair" :
                    watchedRating === 3 ? "Good" :
                    watchedRating === 4 ? "Very Good" : "Excellent"
                  }
                </>
              ) : (
                "Click to rate"
              )}
            </span>
          </div>
          {form.formState.errors.rating && (
            <p className="text-destructive text-sm">{form.formState.errors.rating.message}</p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Additional Comments (Optional)</Label>
          <Textarea
            id="comment"
            className="bg-input border-border focus:border-primary min-h-24 resize-none"
            placeholder="Share your thoughts about the event... What did you like? What could be improved?"
            {...form.register("comment")}
            data-testid="textarea-feedback-comment"
          />
          <p className="text-xs text-muted-foreground">
            Your feedback helps organizers improve future events
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground glow"
            disabled={!watchedEventId || watchedRating === 0 || submitMutation.isPending}
            data-testid="button-submit-feedback"
          >
            {submitMutation.isPending ? (
              <>
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
