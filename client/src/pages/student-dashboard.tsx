import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Star, Trophy, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import FeedbackForm from "@/components/forms/feedback-form";
import { useAuth } from "@/hooks/use-auth";
import type { Registration, Event, Attendance, Feedback } from "@shared/schema";

interface RegistrationWithEvent extends Registration {
  event: Event;
}

interface AttendanceWithEvent extends Attendance {
  event: Event;
}

interface FeedbackWithEvent extends Feedback {
  event: Event;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<string | null>(null);

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<RegistrationWithEvent[]>({
    queryKey: ["/api/my-registrations"],
  });

  const { data: attendance = [] } = useQuery<AttendanceWithEvent[]>({
    queryKey: ["/api/my-attendance"],
  });

  const { data: feedback = [] } = useQuery<FeedbackWithEvent[]>({
    queryKey: ["/api/my-feedback"],
  });

  // Calculate stats
  const attendedEventIds = new Set(attendance.map(a => a.eventId));
  const feedbackEventIds = new Set(feedback.map(f => f.eventId));
  const attendanceRate = registrations.length > 0 ? (attendance.length / registrations.length) * 100 : 0;
  const averageRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;

  // Get events that can receive feedback (attended but no feedback yet)
  const feedbackEligibleEvents = registrations
    .filter(r => attendedEventIds.has(r.eventId) && !feedbackEventIds.has(r.eventId))
    .map(r => r.event);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Manage your event registrations and activity
            </p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-primary/20 mr-4">
                    <Calendar className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-registered-events">
                      {registrations.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Registered Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-accent/20 mr-4">
                    <CheckCircle className="text-accent h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-attended-events">
                      {attendance.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Attended Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-secondary/20 mr-4">
                    <Star className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-average-rating">
                      {averageRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Rating Given</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-orange-500/20 mr-4">
                    <Trophy className="text-orange-500 h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-attendance-rate">
                      {attendanceRate.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Registrations */}
          <Card className="cyber-border mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">My Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {registrationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg"></div>
                        <div>
                          <div className="h-4 bg-muted-foreground/20 rounded w-48 mb-2"></div>
                          <div className="h-3 bg-muted-foreground/20 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8" data-testid="no-registrations">
                  <p className="text-muted-foreground">No event registrations yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Browse events and register for ones that interest you
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((registration) => {
                    const isAttended = attendedEventIds.has(registration.eventId);
                    const hasFeedback = feedbackEventIds.has(registration.eventId);
                    const eventDate = new Date(registration.event.date);
                    const isUpcoming = eventDate > new Date();
                    
                    return (
                      <motion.div
                        key={registration.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        data-testid={`registration-${registration.event.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            registration.event.type === 'hackathon' ? 'bg-gradient-to-br from-primary to-secondary' :
                            registration.event.type === 'workshop' ? 'bg-gradient-to-br from-secondary to-accent' :
                            registration.event.type === 'festival' ? 'bg-gradient-to-br from-accent to-primary' :
                            'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            {registration.event.type === 'hackathon' && <code className="text-white">💻</code>}
                            {registration.event.type === 'workshop' && <span className="text-white">🛠️</span>}
                            {registration.event.type === 'festival' && <span className="text-white">🎉</span>}
                            {registration.event.type === 'seminar' && <span className="text-white">🎓</span>}
                          </div>
                          <div>
                            <h3 className="font-medium" data-testid={`event-title-${registration.event.id}`}>
                              {registration.event.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {eventDate.toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {registration.event.location}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAttended ? (
                            <Badge className="bg-accent/20 text-accent">Attended</Badge>
                          ) : isUpcoming ? (
                            <Badge className="bg-orange-500/20 text-orange-500">Upcoming</Badge>
                          ) : (
                            <Badge className="bg-muted-foreground/20 text-muted-foreground">Registered</Badge>
                          )}
                          
                          {isAttended && !hasFeedback && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedEventForFeedback(registration.event.id)}
                              data-testid={`button-feedback-${registration.event.id}`}
                            >
                              Rate Event
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          {feedbackEligibleEvents.length > 0 && (
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="text-2xl">Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackForm
                  events={feedbackEligibleEvents}
                  selectedEventId={selectedEventForFeedback}
                  onEventSelect={setSelectedEventForFeedback}
                  onSuccess={() => setSelectedEventForFeedback(null)}
                />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
