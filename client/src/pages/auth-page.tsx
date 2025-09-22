import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      artistName: "",
    },
  });

  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to MusicFlow</h1>
            <p className="text-muted-foreground mt-2">
              Your professional music distribution platform
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign in to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        {...loginForm.register("email")}
                        data-testid="input-email-login"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-destructive text-sm" data-testid="text-error-email">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                        data-testid="input-password-login"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-destructive text-sm" data-testid="text-error-password">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-submit-login"
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create your account</CardTitle>
                  <CardDescription>
                    Join MusicFlow and start distributing your music
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        {...registerForm.register("email")}
                        data-testid="input-email-register"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-destructive text-sm" data-testid="text-error-email-register">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        placeholder="your_username"
                        {...registerForm.register("username")}
                        data-testid="input-username-register"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-destructive text-sm" data-testid="text-error-username">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-artist-name">Artist Name (Optional)</Label>
                      <Input
                        id="register-artist-name"
                        placeholder="Your Artist Name"
                        {...registerForm.register("artistName")}
                        data-testid="input-artist-name-register"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register("password")}
                        data-testid="input-password-register"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-destructive text-sm" data-testid="text-error-password-register">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register("confirmPassword")}
                        data-testid="input-confirm-password-register"
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-destructive text-sm" data-testid="text-error-confirm-password">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-submit-register"
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary to-secondary items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <Music className="h-24 w-24 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Distribute Your Music</h2>
          <p className="text-lg opacity-90 mb-6">
            Join thousands of artists who trust MusicFlow to distribute their music worldwide. 
            Get detailed analytics, manage your tracks, and grow your audience.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Global Distribution</div>
              <div className="opacity-75">Reach 150+ platforms</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Real-time Analytics</div>
              <div className="opacity-75">Track your performance</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Keep 100% Rights</div>
              <div className="opacity-75">Own your music</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Fast Payouts</div>
              <div className="opacity-75">Monthly revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
