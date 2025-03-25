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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    organizationType: "healthcare",
    organizationName: "",
  });
  const [user, setUser] = useState<User[]>([]);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      if (userData.role === "admin") {
        router.push("/admin");
        console.log(userData.role);
      } else {
        router.push("/partner");
        console.log(userData.role);
      }

      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      //  Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: registerData.email,
          password: registerData.password,
          options: {
            data: {
              name: registerData.name,
              organization_type: registerData.organizationType,
              organization_name: registerData.organizationName,
              role: "partner", // Default role for new users
            },
          },
        }
      );

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const newUser = {
        id: authData.user?.id,
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        organization_type: registerData.organizationType,
        organization_name: registerData.organizationName,
        role: "partner",
      };

      const { data, error: insertError } = await supabase
        .from("users")
        .insert([newUser])
        .select();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      //  Update state and close the dialog
      setUser((prev) => [...prev, data[0]]);
      setIsRegisterOpen(false);
      setError("Please check your email for verification");
      router.push("/login"); // Redirect to login page after registration
    } catch (err) {
      setError("An unexpected error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <Shield className="h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to{" "}
          </CardTitle>
          <span className="text-4xl text-red-600 font-[emoji] tracking-[.12em] font-bold md:text-center ">
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
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button variant="link">Need an account? Register here</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-type">Organization Type</Label>
                    <select
                      id="org-type"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={registerData.organizationType}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          organizationType: e.target.value,
                        })
                      }
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
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Register
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
