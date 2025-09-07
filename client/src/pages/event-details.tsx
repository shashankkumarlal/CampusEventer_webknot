import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, User, Star, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import Navbar from "../components/navbar";
import FeedbackForm from "../components/forms/feedback-form";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";

// Define interfaces based on actual database schema
interface Event {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string;
  capacity: number;
  registrationDeadline: Date | null;
  status: string;
  imageUrl: string | null;
  tags: string | null;
  requirements: string | null;
  createdAt: Date;
  createdBy: string;
  collegeId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  collegeId: string;
}

interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  registeredAt: Date;
}

interface Attendance {
  id: string;
  eventId: string;
  studentId: string;
  checkinMethod: string;
  checkedInAt: Date;
}

interface Feedback {
  id: string;
  eventId: string;
  studentId: string;
  rating: number;
  comment: string | null;
  submittedAt: Date;
}

interface EventWithRegistrationCount extends Event {
  registrationCount: number;
}

interface RegistrationWithStudent extends Registration {
  student: User;
}

interface AttendanceWithStudent extends Attendance {
  student: User;
}

interface FeedbackWithStudent extends Feedback {
  student: User;
}

export default function EventDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);

  const { data: event, isLoading: eventLoading } = useQuery<EventWithRegistrationCount>({
    queryKey: [`/api/events/${id}`],
    enabled: !!id,
  });

  const { data: registrations = [] } = useQuery<RegistrationWithStudent[]>({
    queryKey: [`/api/events/${id}/registrations`],
    enabled: !!id && user?.role === "admin",
  });

  const { data: attendance = [] } = useQuery<AttendanceWithStudent[]>({
    queryKey: [`/api/events/${id}/attendance`],
    enabled: !!id && user?.role === "admin",
  });

  const { data: feedback = [] } = useQuery<FeedbackWithStudent[]>({
    queryKey: [`/api/events/${id}/feedback`],
    enabled: !!id && user?.role === "admin",
  });

  // Check if current user has already submitted feedback for this event
  const { data: userFeedback } = useQuery<Feedback[]>({
    queryKey: [`/api/my-feedback`],
    enabled: !!user && user.role === "student",
  });

  const hasSubmittedFeedback = userFeedback?.some(f => f.eventId === id);

  const { data: myRegistrations = [] } = useQuery<Registration[]>({
    queryKey: ["/api/my-registrations"],
    enabled: user?.role === "student",
  });

  const { data: myAttendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/my-attendance"],
    enabled: user?.role === "student",
  });

  const isRegistered = myRegistrations.some(reg => reg.eventId === id);
  const hasAttended = myAttendance.some(att => att.eventId === id);
  
  // Only show feedback option for students who have attended the event
  const canGiveFeedback = user?.role === "student" && hasAttended && !hasSubmittedFeedback;

  const registerMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${id}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-registrations"] });
      toast({
        title: "Registration Successful!",
        description: "You've been registered for this event.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/events/${id}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-registrations"] });
      toast({
        title: "Registration Cancelled",
        description: "Your registration has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${id}/attendance`, { checkinMethod: "manual" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-attendance"] });
      toast({
        title: "Checked In!",
        description: "You've successfully checked in to this event.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "workshop": return "bg-blue-500";
      case "seminar": return "bg-green-500";
      case "conference": return "bg-purple-500";
      case "networking": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  // Extract event type from tags
  const getEventType = (tags: string | null) => {
    if (!tags) return "event";
    try {
      const parsedTags = JSON.parse(tags);
      return parsedTags[0] || "event";
    } catch {
      return "event";
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="cyber-border rounded-xl p-8">
              <div className="h-12 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12" data-testid="event-not-found">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const isFull = event.registrationCount >= event.capacity;
  const registrationPercentage = (event.registrationCount / event.capacity) * 100;
  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6 hover:bg-muted"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Header */}
              <Card className="cyber-border hover-glow">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <Badge 
                      className={
                        getEventType(event.tags) === 'hackathon' ? 'bg-primary/20 text-primary border-primary/40' :
                        getEventType(event.tags) === 'workshop' ? 'bg-secondary/20 text-secondary border-secondary/40' :
                        getEventType(event.tags) === 'festival' ? 'bg-accent/20 text-accent border-accent/40' :
                        'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      }
                      data-testid="event-type"
                    >
                      {getEventType(event.tags).toUpperCase()}
                    </Badge>
                    <Badge 
                      className={
                        event.status === 'active' ? 'bg-accent/20 text-accent border-accent/40' :
                        event.status === 'upcoming' ? 'bg-primary/20 text-primary border-primary/40' :
                        event.status === 'completed' ? 'bg-muted text-muted-foreground' :
                        'bg-destructive/20 text-destructive border-destructive/40'
                      }
                      data-testid="event-status"
                    >
                      {event.status}
                    </Badge>
                  </div>

                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="event-title">
                    {event.title}
                  </h1>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm" data-testid="event-date">
                        {eventDate.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm" data-testid="event-time">
                        {eventDate.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm" data-testid="event-location">
                        {event.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="text-sm" data-testid="event-organizer">
                        Event Organizer
                      </span>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">About this Event</h3>
                    <p className="text-muted-foreground leading-relaxed" data-testid="event-description">
                      {event.description}
                    </p>
                  </div>

                  {feedback.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium" data-testid="event-rating">
                          {averageRating.toFixed(1)} ({feedback.length} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration/Attendance Management for Admins */}
              {user?.role === "admin" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="cyber-border">
                    <CardHeader>
                      <CardTitle>Registrations ({registrations.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {registrations.map((registration) => (
                          <div key={registration.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <span className="font-medium">{registration.student.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(registration.registeredAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cyber-border">
                    <CardHeader>
                      <CardTitle>Attendance ({attendance.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {attendance.map((att) => (
                          <div key={att.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <span className="font-medium">{att.student.name}</span>
                            <Badge className="bg-accent/20 text-accent">
                              {att.checkinMethod}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Feedback for Admins */}
              {user?.role === "admin" && feedback.length > 0 && (
                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle>Student Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {feedback.map((fb) => (
                        <div key={fb.id} className="p-4 rounded bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{fb.student.name}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < fb.rating ? "text-yellow-500 fill-current" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {fb.comment && (
                            <p className="text-sm text-muted-foreground">{fb.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card className="cyber-border hover-glow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Capacity</span>
                      <span className="text-sm text-muted-foreground" data-testid="event-capacity">
                        {event.registrationCount} / {event.capacity}
                      </span>
                    </div>
                    <Progress value={registrationPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isFull ? "Event is full" : `${event.capacity - event.registrationCount} spots remaining`}
                    </p>
                  </div>

                  {user?.role === "student" && (
                    <div className="space-y-3">
                      {!isRegistered ? (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground glow"
                          onClick={() => registerMutation.mutate()}
                          disabled={!isUpcoming || isFull || registerMutation.isPending}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? "Registering..." : 
                           !isUpcoming ? "Event has passed" :
                           isFull ? "Event is full" : "Register Now"}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-accent">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">You're registered!</span>
                          </div>
                          
                          {hasAttended && (
                            <Button
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              onClick={() => checkinMutation.mutate()}
                              disabled={checkinMutation.isPending}
                              data-testid="button-checkin"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Already Checked In
                            </Button>
                          )}

                          {/* Feedback Button for Students */}
                          {canGiveFeedback && (
                            <Button
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                              onClick={() => setShowFeedbackForm(true)}
                              data-testid="button-give-feedback"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Give Feedback
                            </Button>
                          )}

                          {hasSubmittedFeedback && (
                            <Button
                              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                              disabled
                              data-testid="button-feedback-submitted"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Feedback Submitted
                            </Button>
                          )}

                          {hasAttended && (
                            <div className="flex items-center space-x-2 text-accent">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">You attended this event</span>
                            </div>
                          )}
                          
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => unregisterMutation.mutate()}
                            disabled={unregisterMutation.isPending || hasAttended}
                            data-testid="button-unregister"
                          >
                            {unregisterMutation.isPending ? "Cancelling..." : "Cancel Registration"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Stats */}
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="text-lg">Event Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Registered</span>
                      </div>
                      <span className="font-medium" data-testid="stat-registered">
                        {event.registrationCount}
                      </span>
                    </div>

                    {user?.role === "admin" && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-accent" />
                            <span className="text-sm">Attended</span>
                          </div>
                          <span className="font-medium" data-testid="stat-attended">
                            {attendance.length}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Feedback</span>
                          </div>
                          <span className="font-medium" data-testid="stat-feedback">
                            {feedback.length}
                          </span>
                        </div>

                        {feedback.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Average Rating</span>
                            <span className="font-medium" data-testid="stat-avg-rating">
                              {averageRating.toFixed(1)} ★
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Feedback Form Dialog */}
      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackForm
            events={event ? [event] : []}
            selectedEventId={event?.id}
            onSuccess={() => {
              setShowFeedbackForm(false);
              queryClient.invalidateQueries({ queryKey: [`/api/my-feedback`] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
