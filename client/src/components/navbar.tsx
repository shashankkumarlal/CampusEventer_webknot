import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Bell, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { label: "Events", href: "/", roles: ["student", "admin"] },
    { label: "Admin Panel", href: "/admin-dashboard", roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container max-w-7xl mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setLocation("/")}
            whileHover={{ scale: 1.05 }}
            data-testid="navbar-logo"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary glow animate-pulse-glow"></div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CampusEvents
            </span>
          </motion.div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
          {filteredNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => setLocation(item.href)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              {item.label}
            </Button>
          ))}
        </div>
        
        {/* Right Side */}
        <div className="flex flex-1 items-center justify-end space-x-4 md:justify-end">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-muted"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Mock notification badge - replace with real notification count */}
            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"></div>
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted" data-testid="user-menu-trigger">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <span className="text-sm font-medium" data-testid="user-name">
                      {user.name}
                    </span>
                    <Badge 
                      className={`ml-2 text-xs ${
                        user.role === 'admin' 
                          ? 'bg-secondary/20 text-secondary' 
                          : 'bg-primary/20 text-primary'
                      }`}
                      data-testid="user-role"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 cyber-border bg-background">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setLocation("/")}
                  className="cursor-pointer"
                  data-testid="menu-events"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Events</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  disabled={logoutMutation.isPending}
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setLocation("/auth")}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground glow"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 cyber-border bg-background">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-secondary glow"></div>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      CampusEvents
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col space-y-3">
                  {filteredNavItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      onClick={() => {
                        setLocation(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
