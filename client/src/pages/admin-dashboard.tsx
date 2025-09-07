import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Users, Calendar, TrendingUp, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import Navbar from "../components/navbar";
import EventForm from "../components/forms/event-form";
import EventPopularityChart from "../components/charts/event-popularity-chart";
import AttendanceChart from "../components/charts/attendance-chart";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useLocation } from "wouter";

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

interface EventWithRegistrationCount extends Event {
  registrationCount: number;
}

interface RegistrationWithStudent extends Registration {
  student: User;
}

interface PopularityData {
  eventId: string;
  title: string;
  registrationCount: number;
}

interface TopStudent {
  studentId: string;
  name: string;
  attendanceCount: number;
}

interface FeedbackAnalytics {
  eventId: string;
  title: string;
  averageRating: number;
  feedbackCount: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<EventWithRegistrationCount[]>({
    queryKey: ["/api/events"],
  });

  const { data: popularityData = [] } = useQuery<PopularityData[]>({
    queryKey: ["/api/reports/popularity"],
  });

  const { data: topStudents = [] } = useQuery<TopStudent[]>({
    queryKey: ["/api/reports/top-students"],
  });

  const { data: feedbackAnalytics = [] } = useQuery<FeedbackAnalytics[]>({
    queryKey: ["/api/reports/feedback"],
  });

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, event) => sum + event.registrationCount, 0);
  const averageRegistrations = totalEvents > 0 ? totalRegistrations / totalEvents : 0;

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("DELETE", `/api/events/${eventId}`);
      // DELETE returns 204 No Content, so don't try to parse JSON
      if (response.status === 204) {
        return null;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEventCreated = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
    refetchEvents();
  };

  const handleViewEvent = (eventId: string) => {
    setLocation(`/events/${eventId}`);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Manage events, students, and view comprehensive reports
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-primary/20 mr-4">
                    <Calendar className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-events">
                      {totalEvents}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-accent/20 mr-4">
                    <Users className="text-accent h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-registrations">
                      {totalRegistrations}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Registrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-secondary/20 mr-4">
                    <TrendingUp className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-avg-registrations">
                      {averageRegistrations.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg per Event</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cyber-border hover-glow">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-orange-500/20 mr-4">
                    <TrendingUp className="text-orange-500 h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-active-events">
                      {events.filter(e => e.status === 'upcoming' || e.status === 'active').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="cyber-border mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center p-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-all glow h-auto justify-start"
                      data-testid="button-create-event"
                    >
                      <Plus className="mr-3 h-5 w-5" />
                      Create New Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <EventForm
                      event={selectedEvent}
                      onSuccess={handleEventCreated}
                      onCancel={() => {
                        setIsEventFormOpen(false);
                        setSelectedEvent(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  className="flex items-center p-4 bg-gradient-to-r from-secondary to-accent text-secondary-foreground hover:opacity-90 transition-all h-auto justify-start"
                  data-testid="button-view-students"
                >
                  <Users className="mr-3 h-5 w-5" />
                  View All Students
                </Button>
                
                <Button 
                  className="flex items-center p-4 bg-gradient-to-r from-accent to-primary text-accent-foreground hover:opacity-90 transition-all h-auto justify-start"
                  data-testid="button-export-reports"
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Export Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Management */}
          <Card className="cyber-border mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Event Management</CardTitle>
                <div className="flex space-x-4">
                  <Input
                    type="text"
                    placeholder="Search events..."
                    className="w-64 bg-input border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-events"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8" data-testid="no-events">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No events match your search" : "No events created yet"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Registrations</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => {
                        const eventType = getEventType(event.tags);
                        const registrationPercentage = (event.registrationCount / event.capacity) * 100;
                        
                        return (
                          <TableRow key={event.id} className="hover:bg-muted/50" data-testid={`event-row-${event.id}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium" data-testid={`event-title-${event.id}`}>
                                  {event.title}
                                </p>
                                <p className="text-sm text-muted-foreground">{event.location}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  eventType === 'hackathon' ? 'bg-primary/20 text-primary' :
                                  eventType === 'workshop' ? 'bg-secondary/20 text-secondary' :
                                  eventType === 'festival' ? 'bg-accent/20 text-accent' :
                                  'bg-purple-500/20 text-purple-400'
                                }
                              >
                                {eventType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(event.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm">
                                  <span className="font-medium">{event.registrationCount}</span>
                                  <span className="text-muted-foreground">/{event.capacity}</span>
                                </div>
                                <div className="w-16 h-2 bg-muted rounded-full">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      registrationPercentage >= 90 ? 'bg-destructive' :
                                      registrationPercentage >= 70 ? 'bg-orange-500' :
                                      'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  event.status === 'active' ? 'bg-accent/20 text-accent' :
                                  event.status === 'upcoming' ? 'bg-primary/20 text-primary' :
                                  event.status === 'completed' ? 'bg-muted text-muted-foreground' :
                                  'bg-destructive/20 text-destructive'
                                }
                              >
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="p-2 text-primary hover:bg-primary/20"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setIsEventFormOpen(true);
                                  }}
                                  data-testid={`button-edit-${event.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="p-2 text-muted-foreground hover:bg-muted"
                                  onClick={() => handleViewEvent(event.id)}
                                  data-testid={`button-view-${event.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="p-2 text-destructive hover:bg-destructive/20"
                                      data-testid={`button-delete-${event.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Popularity Chart */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="text-xl">Event Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                <EventPopularityChart data={popularityData} />
              </CardContent>
            </Card>

            {/* Top Students Leaderboard */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="text-xl">Top Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStudents.slice(0, 5).map((student, index) => (
                    <div key={student.studentId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-yellow-700' :
                          'bg-gradient-to-br from-primary to-secondary'
                        }`}>
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`student-name-${index}`}>
                            {student.name}
                          </p>
                          <p className="text-sm text-muted-foreground">Student</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium" data-testid={`student-attendance-${index}`}>
                          {student.attendanceCount}
                        </p>
                        <p className="text-xs text-muted-foreground">events</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Analytics */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="text-xl">Feedback Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Satisfaction</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < 4 ? "text-yellow-500" : "text-muted-foreground"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium">4.6</span>
                    </div>
                  </div>
                  
                  {feedbackAnalytics.slice(0, 3).map((feedback) => (
                    <div key={feedback.eventId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{feedback.title}</span>
                        <span className="text-muted-foreground">
                          {feedback.averageRating?.toFixed(1) || 'N/A'} ★ ({feedback.feedbackCount})
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${((feedback.averageRating || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Overview */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="text-xl">Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceChart data={popularityData} />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
