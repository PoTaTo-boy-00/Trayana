"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Users, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Personnel } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("*")
        .limit(1);
      if (error) {
        console.error("Supabase connection error:", error);
      } else {
        console.log("Supabase connection successful. Data:", data);
      }
    };

    testSupabaseConnection();
  }, []);
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase.from("personnel").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setPersonnel(data);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async (newPersonnel: Personnel) => {
    const { data, error } = await supabase
      .from("personnel")
      .insert([newPersonnel])
      .select();
    if (error) {
      console.error("Error creating alert:", error);
    } else {
      setPersonnel((prev) => [...prev, data[0]]);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Personnel Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Personnel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personnel Information</DialogTitle>
            </DialogHeader>
            <MessageForm onSubmit={handleSendMessage} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {personnel.map((person) => (
          <Card key={person.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                {person.name}
              </CardTitle>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  person.status === "available"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : person.status === "deployed"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}
              >
                {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{person.role}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {person.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-secondary rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{person.contact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{person.contact.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
// Form component for sending a new message
interface MessageFormProps {
  onSubmit: (personnel: Personnel) => void;
}

function MessageForm({ onSubmit }: MessageFormProps) {
  const [formData, setFormData] = useState<Omit<Personnel, "id" | "timestamp">>(
    {
      name: "user1", // Default sender (can be dynamic based on logged-in user)
      role: "",
      status: "available",
      skills: [],

      contact: {
        phone: "",
        email: "",
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPersonnel: Personnel = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
      timestamp: new Date().toISOString(),
      status: "available", // Default status
    };
    onSubmit(newPersonnel);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Role</Label>
        <Input
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as Personnel["status"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          value={formData.contact.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: { ...formData.contact, phone: e.target.value },
            })
          }
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          value={formData.contact.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: { ...formData.contact, email: e.target.value },
            })
          }
        />
      </div>

      <Button type="submit">Add Personnel</Button>
    </form>
  );
}
