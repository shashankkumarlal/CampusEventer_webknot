import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/navbar";
import EventCard from "@/components/event-card";
import type { Event } from "@shared/schema";

const eventTypes = [
  { value: "hackathon", label: "Hackathons", icon: "💻" },
  { value: "workshop", label: "Workshops", icon: "🛠️" },
  { value: "festival", label: "Festivals", icon: "🎉" },
  { value: "seminar", label: "Seminars", icon: "🎓" },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState("date");

  const { data: events = [], isLoading } = useQuery<(Event & { registrationCount: number })[]>({
    queryKey: ["/api/events", { type: selectedType, search: searchTerm }],
  });

  const filteredEvents = events.filter(event => {
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedType && event.type !== selectedType) {
      return false;
    }
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === "popularity") {
      return b.registrationCount - a.registrationCount;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 chart-grid opacity-20 rounded-xl"></div>
            <div className="relative cyber-border rounded-xl p-12 hover-glow">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-float"
                data-testid="hero-title"
              >
                Discover Campus Events
              </motion.h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hackathons, workshops, seminars, and festivals. Connect with peers and build your future.
              </p>
              
              {/* Search & Filters */}
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search events by name..."
                      className="pl-10 bg-input border-border focus:border-primary focus:ring-1 focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="search-events"
                    />
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground glow"
                    data-testid="button-search"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
                
                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedType === "" ? "default" : "outline"}
                    onClick={() => setSelectedType("")}
                    className={selectedType === "" ? "bg-primary text-primary-foreground" : ""}
                    data-testid="filter-all"
                  >
                    All Events
                  </Button>
                  {eventTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={selectedType === type.value ? "default" : "outline"}
                      onClick={() => setSelectedType(selectedType === type.value ? "" : type.value)}
                      className={selectedType === type.value ? "bg-primary text-primary-foreground" : ""}
                      data-testid={`filter-${type.value}`}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Events Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground" data-testid="events-section-title">
              Upcoming Events
            </h2>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-input border-border" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="popularity">Sort by Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="cyber-border rounded-xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-12" data-testid="no-events">
              <div className="cyber-border rounded-xl p-12">
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedType 
                    ? "Try adjusting your search filters" 
                    : "Check back later for upcoming events"}
                </p>
              </div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {sortedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}
