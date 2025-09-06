import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Code, Users, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { College } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["student", "admin"]),
  collegeId: z.string().min(1, "Please select a college"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const { data: colleges = [], isLoading: collegesLoading, error: collegesError } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      role: "student",
      collegeId: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const onRegister = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary glow animate-pulse-glow mb-4"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CampusEvents
            </h1>
            <p className="text-muted-foreground mt-2">
              Your gateway to campus innovation
            </p>
          </div>

          <Card className="cyber-border glow">
            <CardHeader>
              <CardTitle className="text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        className="bg-input border-border focus:border-primary"
                        {...loginForm.register("username")}
                        data-testid="input-login-username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-destructive text-sm mt-1">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        className="bg-input border-border focus:border-primary"
                        {...loginForm.register("password")}
                        data-testid="input-login-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-destructive text-sm mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground glow"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-name">Full Name</Label>
                        <Input
                          id="register-name"
                          type="text"
                          className="bg-input border-border focus:border-primary"
                          {...registerForm.register("name")}
                          data-testid="input-register-name"
                        />
                        {registerForm.formState.errors.name && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          type="text"
                          className="bg-input border-border focus:border-primary"
                          {...registerForm.register("username")}
                          data-testid="input-register-username"
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        className="bg-input border-border focus:border-primary"
                        {...registerForm.register("email")}
                        data-testid="input-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-destructive text-sm mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-role">Role</Label>
                        <Select onValueChange={(value) => registerForm.setValue("role", value as "student" | "admin")}>
                          <SelectTrigger className="bg-input border-border" data-testid="select-register-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {registerForm.formState.errors.role && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.role.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="register-college">College</Label>
                        <Select onValueChange={(value) => registerForm.setValue("collegeId", value)}>
                          <SelectTrigger className="bg-input border-border" data-testid="select-register-college">
                            <SelectValue placeholder={collegesLoading ? "Loading colleges..." : colleges.length === 0 ? "No colleges available" : "Select college"} />
                          </SelectTrigger>
                          <SelectContent>
                            {collegesLoading ? (
                              <SelectItem value="" disabled>Loading...</SelectItem>
                            ) : colleges.length === 0 ? (
                              <SelectItem value="" disabled>No colleges available</SelectItem>
                            ) : (
                              colleges.map((college) => (
                                <SelectItem key={college.id} value={college.id}>
                                  {college.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {registerForm.formState.errors.collegeId && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.collegeId.message}
                          </p>
                        )}
                        {collegesError && (
                          <p className="text-destructive text-sm mt-1">
                            Failed to load colleges. Please refresh the page.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          className="bg-input border-border focus:border-primary"
                          {...registerForm.register("password")}
                          data-testid="input-register-password"
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="register-confirm-password">Confirm Password</Label>
                        <Input
                          id="register-confirm-password"
                          type="password"
                          className="bg-input border-border focus:border-primary"
                          {...registerForm.register("confirmPassword")}
                          data-testid="input-register-confirm-password"
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-secondary to-accent text-secondary-foreground"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="cyber-border rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Join the Future of Campus Events
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Connect with peers, discover opportunities, and build your future through innovative campus events.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 cyber-border rounded-lg hover-glow">
                <Code className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Hackathons</h3>
                <p className="text-sm text-muted-foreground">Code the future</p>
              </div>
              
              <div className="text-center p-4 cyber-border rounded-lg hover-glow">
                <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold">Workshops</h3>
                <p className="text-sm text-muted-foreground">Learn together</p>
              </div>
              
              <div className="text-center p-4 cyber-border rounded-lg hover-glow">
                <Calendar className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">Festivals</h3>
                <p className="text-sm text-muted-foreground">Celebrate innovation</p>
              </div>
              
              <div className="text-center p-4 cyber-border rounded-lg hover-glow">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Seminars</h3>
                <p className="text-sm text-muted-foreground">Expand horizons</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
