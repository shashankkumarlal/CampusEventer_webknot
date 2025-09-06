import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { CalendarIcon, Clock, MapPin, Users, FileText, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Event, College, InsertEvent } from "@shared/schema";

const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  type: z.enum(["hackathon", "workshop", "festival", "seminar"]),
  date: z.date({ required_error: "Event date is required" }),
  time: z.string().min(1, "Event time is required"),
  location: z.string().min(1, "Location is required").max(200, "Location too long"),
  organizer: z.string().min(1, "Organizer name is required").max(200, "Organizer name too long"),
  maxCapacity: z.number().min(1, "Capacity must be at least 1").max(10000, "Capacity too high"),
  status: z.enum(["upcoming", "active", "completed", "cancelled"]),
  collegeId: z.string().min(1, "Please select a college"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      type: event?.type || "workshop",
      date: event?.date ? new Date(event.date) : undefined,
      time: event?.time || "",
      location: event?.location || "",
      organizer: event?.organizer || "",
      maxCapacity: event?.maxCapacity || 50,
      status: event?.status || "upcoming",
      collegeId: event?.collegeId || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData: InsertEvent = {
        ...data,
        date: data.date.toISOString(),
        collegeId: data.collegeId,
      };
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Created!",
        description: "Your event has been successfully created.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (!event) throw new Error("Event not found");
      const eventData: Partial<InsertEvent> = {
        ...data,
        date: data.date.toISOString(),
        collegeId: data.collegeId,
      };
      const response = await apiRequest("PUT", `/api/events/${event.id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Updated!",
        description: "Your event has been successfully updated.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (event) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {event ? "Edit Event" : "Create New Event"}
        </CardTitle>
        <CardDescription>
          {event ? "Update your event details" : "Fill out the form to create a new campus event"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  className="bg-input border-border focus:border-primary"
                  placeholder="Enter event title"
                  {...form.register("title")}
                  data-testid="input-event-title"
                />
                {form.formState.errors.title && (
                  <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select onValueChange={(value) => form.setValue("type", value as any)} value={form.watch("type")}>
                  <SelectTrigger className="bg-input border-border" data-testid="select-event-type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-destructive text-sm">{form.formState.errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                className="bg-input border-border focus:border-primary min-h-24 resize-none"
                placeholder="Describe your event in detail..."
                {...form.register("description")}
                data-testid="textarea-event-description"
              />
              {form.formState.errors.description && (
                <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-input border-border",
                        !form.watch("date") && "text-muted-foreground"
                      )}
                      data-testid="button-select-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 cyber-border bg-background" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("date")}
                      onSelect={(date) => form.setValue("date", date!)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="text-destructive text-sm">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time *</Label>
                <Input
                  id="time"
                  type="time"
                  className="bg-input border-border focus:border-primary"
                  {...form.register("time")}
                  data-testid="input-event-time"
                />
                {form.formState.errors.time && (
                  <p className="text-destructive text-sm">{form.formState.errors.time.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location & Logistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Location & Logistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  className="bg-input border-border focus:border-primary"
                  placeholder="Enter event location"
                  {...form.register("location")}
                  data-testid="input-event-location"
                />
                {form.formState.errors.location && (
                  <p className="text-destructive text-sm">{form.formState.errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer *</Label>
                <Input
                  id="organizer"
                  className="bg-input border-border focus:border-primary"
                  placeholder="Enter organizer name"
                  {...form.register("organizer")}
                  data-testid="input-event-organizer"
                />
                {form.formState.errors.organizer && (
                  <p className="text-destructive text-sm">{form.formState.errors.organizer.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Max Capacity *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  max="10000"
                  className="bg-input border-border focus:border-primary"
                  placeholder="Enter maximum capacity"
                  {...form.register("maxCapacity", { valueAsNumber: true })}
                  data-testid="input-event-capacity"
                />
                {form.formState.errors.maxCapacity && (
                  <p className="text-destructive text-sm">{form.formState.errors.maxCapacity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College *</Label>
                <Select onValueChange={(value) => form.setValue("collegeId", value)} value={form.watch("collegeId")}>
                  <SelectTrigger className="bg-input border-border" data-testid="select-event-college">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.collegeId && (
                  <p className="text-destructive text-sm">{form.formState.errors.collegeId.message}</p>
                )}
              </div>
            </div>

            {event && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => form.setValue("status", value as any)} value={form.watch("status")}>
                  <SelectTrigger className="bg-input border-border" data-testid="select-event-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-destructive text-sm">{form.formState.errors.status.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel-event"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground glow"
              disabled={isLoading}
              data-testid="button-submit-event"
            >
              {isLoading ? (
                <>
                  {event ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {event ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
