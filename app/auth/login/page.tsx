"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User } from "@/app/types";

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationType: string;
  organizationName: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
    organizationType: "healthcare",
    organizationName: "",
  });

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Fetch user session to get metadata
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Login failed. Please try again.");
        return;
      }

      const userData = session.user.user_metadata;

      // Redirect based on role
      if (userData?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/partner");
      }

      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsRegisterLoading(true);

    // Enhanced validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !registerData.email ||
      !registerData.password ||
      !registerData.name ||
      !registerData.organizationType ||
      !registerData.organizationName
    ) {
      setError("All fields are required.");
      setIsRegisterLoading(false);
      return;
    }

    if (!emailRegex.test(registerData.email)) {
      setError("Please enter a valid email address.");
      setIsRegisterLoading(false);
      return;
    }

    // Password strength validation
    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsRegisterLoading(false);
      return;
    }

    // Trim whitespace from inputs
    const trimmedData = {
      email: registerData.email.trim().toLowerCase(),
      password: registerData.password,
      name: registerData.name.trim(),
      organizationType: registerData.organizationType,
      organizationName: registerData.organizationName.trim(),
    };

    try {
      console.log("Attempting signup with:", {
        email: trimmedData.email,
        // Don't log password for security
        metadata: {
          name: trimmedData.name,
          organization_type: trimmedData.organizationType,
          organization_name: trimmedData.organizationName,
          role: "partner",
        },
      });

      // Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: trimmedData.email,
          password: trimmedData.password,
          options: {
            data: {
              name: trimmedData.name,
              organization_type: trimmedData.organizationType,
              organization_name: trimmedData.organizationName,
              role: "partner",
            },
          },
        }
      );

      console.log("Signup response:", { authData, signUpError });

      if (signUpError) {
        console.error("Signup error details:", signUpError);

        // Handle specific Supabase auth errors
        if (signUpError.message.includes("User already registered")) {
          setError(
            "An account with this email already exists. Please try logging in instead."
          );
        } else if (signUpError.message.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else if (signUpError.message.includes("Password")) {
          setError(
            "Password must be at least 6 characters long and contain valid characters."
          );
        } else if (signUpError.message.includes("Signup is disabled")) {
          setError(
            "New registrations are currently disabled. Please contact support."
          );
        } else {
          setError(`Registration failed: ${signUpError.message}`);
        }
        return;
      }

      if (!authData.user) {
        setError("User registration failed. Please try again.");
        return;
      }

      // Only proceed with database inserts if auth signup was successful
      try {
        const newUser = {
          id: authData.user.id,
          email: trimmedData.email,
          name: trimmedData.name,
          organization_type: trimmedData.organizationType,
          organization_name: trimmedData.organizationName,
          role: "partner",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        // Insert into 'users' table
        const { error: insertError } = await supabase
          .from("users")
          .insert([newUser]);

        if (insertError) {
          console.error("User insert error:", insertError);
          setError(`Failed to create user profile: ${insertError.message}`);
          return;
        }

        // Prepare organization data with minimal required fields
        // Note: This creates a basic organization record that will need to be completed later
        const newOrganization = {
          name: trimmedData.organizationName,
          type: trimmedData.organizationType as
            | "healthcare"
            | "ngo"
            | "essential"
            | "infrastructure"
            | "community"
            | "private"
            | "specialized",
          admin_id: authData.user.id,
          // Required fields with default values - should be updated later by user
          capabilities: [],
          coverage: {
            center: { lat: 0, lng: 0 }, // Default coordinates - should be updated
            radius: 0,
          },
          status: "pending" as const,
          contact: {
            email: trimmedData.email,
            phone: "",
            emergency: "",
          },
          address: "",
          operatingHours: {
            start: "09:00",
            end: "17:00",
            timezone: "UTC",
          },
          resources: [],
          personnel: [],
        };

        const { error: orgInsertError } = await supabase
          .from("organizations")
          .insert([newOrganization]);

        if (orgInsertError) {
          console.error("Organization insert error:", orgInsertError);
          setError(`Failed to create organization: ${orgInsertError.message}`);
          return;
        }

        // Reset form and close dialog on success
        setRegisterData({
          email: "",
          password: "",
          name: "",
          organizationType: "healthcare",
          organizationName: "",
        });
        setIsRegisterOpen(false);
        setError(
          "Registration successful! Please check your email for verification."
        );
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        setError(
          "Registration completed but failed to save additional data. Please contact support."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred during registration");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <Shield className="h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to
          </CardTitle>
          <span className="text-4xl text-red-600 font-bold tracking-wider text-center">
            त्रyana
          </span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button variant="link">Need an account? Register here</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register Organization</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      disabled={isRegisterLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      disabled={isRegisterLoading}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      disabled={isRegisterLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-type">Organization Type</Label>
                    <select
                      id="org-type"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={registerData.organizationType}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          organizationType: e.target.value,
                        })
                      }
                      disabled={isRegisterLoading}
                      required
                    >
                      <option value="healthcare">Healthcare</option>
                      <option value="ngo">NGO & Humanitarian</option>
                      <option value="essential">Essential Services</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="community">Community Support</option>
                      <option value="private">Private Sector</option>
                      <option value="specialized">Specialized Response</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={registerData.organizationName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          organizationName: e.target.value,
                        })
                      }
                      disabled={isRegisterLoading}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
