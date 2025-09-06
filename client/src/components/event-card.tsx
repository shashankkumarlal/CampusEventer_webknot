import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@shared/schema";

interface EventWithRegistrationCount extends Event {
  registrationCount: number;
}

interface EventCardProps {
  event: EventWithRegistrationCount;
}

export default function EventCard({ event }: EventCardProps) {
  const [, setLocation] = useLocation();
  
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const isFull = event.registrationCount >= event.maxCapacity;
  const registrationPercentage = (event.registrationCount / event.maxCapacity) * 100;

  const getEventIcon = () => {
    switch (event.type) {
      case 'hackathon':
        return '💻';
      case 'workshop':
        return '🛠️';
      case 'festival':
        return '🎉';
      case 'seminar':
        return '🎓';
      default:
        return '📅';
    }
  };

  const getGradientClasses = () => {
    switch (event.type) {
      case 'hackathon':
        return 'from-primary/20 to-secondary/20';
      case 'workshop':
        return 'from-secondary/20 to-accent/20';
      case 'festival':
        return 'from-accent/20 to-primary/20';
      case 'seminar':
        return 'from-purple-500/20 to-pink-500/20';
      default:
        return 'from-primary/20 to-secondary/20';
    }
  };

  const getButtonGradient = () => {
    switch (event.type) {
      case 'hackathon':
        return 'from-primary to-secondary';
      case 'workshop':
        return 'from-secondary to-accent';
      case 'festival':
        return 'from-accent to-primary';
      case 'seminar':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-primary to-secondary';
    }
  };

  const getTypeColor = () => {
    switch (event.type) {
      case 'hackathon':
        return 'text-primary';
      case 'workshop':
        return 'text-secondary';
      case 'festival':
        return 'text-accent';
      case 'seminar':
        return 'text-purple-400';
      default:
        return 'text-primary';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cyber-border hover-glow cursor-pointer group transition-all duration-300 h-full"
        onClick={() => setLocation(`/events/${event.id}`)}
        data-testid={`event-card-${event.id}`}
      >
        <CardContent className="p-6">
          <div className="relative mb-4">
            <div className={`w-full h-48 rounded-lg bg-gradient-to-br ${getGradientClasses()} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 chart-grid opacity-10 rounded-lg"></div>
              <span className="text-4xl z-10">{getEventIcon()}</span>
            </div>
            
            <Badge 
              className={`absolute top-3 right-3 ${
                event.type === 'hackathon' ? 'bg-primary text-primary-foreground' :
                event.type === 'workshop' ? 'bg-secondary text-secondary-foreground' :
                event.type === 'festival' ? 'bg-accent text-accent-foreground' :
                'bg-purple-500 text-white'
              }`}
              data-testid={`event-type-${event.id}`}
            >
              {event.type}
            </Badge>
            
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium border border-border">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span data-testid={`event-capacity-${event.id}`}>
                  {event.registrationCount}/{event.maxCapacity}
                </span>
              </div>
            </div>

            {isFull && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                FULL
              </div>
            )}
          </div>

          <h3 className={`text-xl font-semibold mb-2 group-hover:${getTypeColor()} transition-colors`} data-testid={`event-title-${event.id}`}>
            {event.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`event-description-${event.id}`}>
            {event.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-2" />
              <span data-testid={`event-date-${event.id}`}>
                {eventDate.toLocaleDateString()} at {event.time}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-2" />
              <span data-testid={`event-location-${event.id}`}>
                {event.location}
              </span>
            </div>
          </div>

          {/* Registration Progress */}
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  registrationPercentage >= 90 ? 'bg-destructive' :
                  registrationPercentage >= 70 ? 'bg-orange-500' :
                  'bg-primary'
                }`}
                style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isFull ? "Event is full" : `${event.maxCapacity - event.registrationCount} spots remaining`}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground" data-testid={`event-organizer-${event.id}`}>
              {event.organizer}
            </span>
            
            <Button
              size="sm"
              className={`bg-gradient-to-r ${getButtonGradient()} text-white hover:opacity-90 transition-all`}
              onClick={(e) => {
                e.stopPropagation();
                setLocation(`/events/${event.id}`);
              }}
              disabled={!isUpcoming}
              data-testid={`button-view-event-${event.id}`}
            >
              {!isUpcoming ? "Event Ended" : isFull ? "View Details" : "Register Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
