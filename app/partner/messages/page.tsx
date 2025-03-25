"use client";

import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { Send, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message } from "@/app/types";
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

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase
        .from("alerts")
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
      const { data, error } = await supabase.from("messages").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async (newMessage: Message) => {
    const { data, error } = await supabase
      .from("messages")
      .insert([newMessage])
      .select();
    if (error) {
      console.error("Error creating alert:", error);
    } else {
      setMessages((prev) => [...prev, data[0]]);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <MessageForm onSubmit={handleSendMessage} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Input placeholder="Type your message..." className="flex-1" />
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {message.type === "broadcast"
                  ? "Broadcast Message"
                  : message.type === "direct"
                  ? "Direct Message"
                  : "Group Message"}
              </CardTitle>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  message.priority === "urgent"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    : message.priority === "emergency"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                }`}
              >
                {message.priority}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{message.content}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{new Date(message.timestamp).toLocaleString()}</span>
                <span>{message.status}</span>
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
  onSubmit: (message: Message) => void;
}

function MessageForm({ onSubmit }: MessageFormProps) {
  const [formData, setFormData] = useState<
    Omit<Message, "id" | "timestamp" | "status">
  >({
    senderId: "user1", // Default sender (can be dynamic based on logged-in user)
    recipientId: null,
    type: "direct",
    content: "",
    priority: "normal",
    deliveryMethod: "internet",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMessage: Message = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
      timestamp: new Date().toISOString(),
      status: "sent", // Default status
    };
    onSubmit(newMessage);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Message Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as Message["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select message type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="broadcast">Broadcast</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="ussd">USSD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Recipient ID</Label>
        <Input
          value={formData.recipientId || ""}
          onChange={(e) =>
            setFormData({ ...formData, recipientId: e.target.value || null })
          }
          placeholder="Enter recipient ID (leave blank for broadcast)"
        />
      </div>

      <div>
        <Label>Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) =>
            setFormData({ ...formData, priority: value as Message["priority"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Delivery Method</Label>
        <Select
          value={formData.deliveryMethod}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              deliveryMethod: value as Message["deliveryMethod"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select delivery method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internet">Internet</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="ussd">USSD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Message Content</Label>
        <Input
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Type your message..."
          required
        />
      </div>

      <Button type="submit">Send Message</Button>
    </form>
  );
}
