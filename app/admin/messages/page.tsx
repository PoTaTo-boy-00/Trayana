"use client";

import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { Send, MessageSquare, Plus } from "lucide-react";
import axios from "axios";
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
import { useTranslation } from "@/lib/translation-context";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const [translatedMessage, setTranslatedMessage] = useState<Message[]>([]);

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
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  useEffect(() => {
    const translateMessage = async () => {
      const translated = await Promise.all(
        messages.map(async (message) => {
          if (language === "en") return message; // No need to translate if English

          try {
            const [titleRes, descRes] = await Promise.all([
              axios.post("/api/translate", {
                text: message.priority,
                targetLang: language,
              }),

              axios.post("/api/translate", {
                text: message.content,
                targetLang: language,
              }),
            ]);

            return {
              ...message,
              priority: titleRes.data.translatedText || message.priority,
              content: descRes.data.translatedText || message.content,
            };
          } catch (error) {
            console.error("Translation error:", error);
            return message; // Return original alert if translation fails
          }
        })
      );
      setTranslatedMessage(translated);
    };

    if (messages.length > 0) {
      translateMessage();
    }
  }, [messages, language]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("messages.title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("messages.button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("messageForm.title")}</DialogTitle>
            </DialogHeader>
            <MessageForm onSubmit={handleSendMessage} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {translatedMessage.map((message) => (
          <Card key={message.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {message.type === "broadcast"
                  ? t("messages.msgType.broadcast")
                  : message.type === "direct"
                  ? t("messages.msgType.direct")
                  : t("messages.msgType.group")}
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
  const { t } = useTranslation();
  const [formData, setFormData] = useState<
    Omit<Message, "id" | "timestamp" | "status">
  >({
    senderId: null,
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
        <Label>{t("messageForm.type.title")}</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as Message["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("messageForm.type.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="direct">
              {t("messageForm.type.options.direct")}
            </SelectItem>
            <SelectItem value="group">
              {t("messageForm.type.options.group")}
            </SelectItem>
            <SelectItem value="broadcast">
              {t("messageForm.type.options.broadcast")}
            </SelectItem>
            <SelectItem value="sms">
              {t("messageForm.type.options.sms")}
            </SelectItem>
            <SelectItem value="ussd">
              {t("messageForm.type.options.ussd")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label> {t("messageForm.recipientId.title")} </Label>
        <Input
          value={formData.recipientId || ""}
          onChange={(e) =>
            setFormData({ ...formData, recipientId: e.target.value || null })
          }
          placeholder={t("messageForm.recipientId.placeholder")}
        />
      </div>

      <div>
        <Label>{t("messageForm.priority.title")}</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) =>
            setFormData({ ...formData, priority: value as Message["priority"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("messageForm.priority.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">
              {t("messageForm.priority.options.normal")}
            </SelectItem>
            <SelectItem value="urgent">
              {t("messageForm.priority.options.urgent")}
            </SelectItem>
            <SelectItem value="emergency">
              {t("messageForm.priority.options.emergency")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("messageForm.deliveryMethod.title")}</Label>
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
            <SelectValue
              placeholder={t("messageForm.deliveryMethod.placeholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internet">
              {t("messageForm.deliveryMethod.options.internet")}
            </SelectItem>
            <SelectItem value="sms">
              {t("messageForm.deliveryMethod.options.sms")}
            </SelectItem>
            <SelectItem value="ussd">
              {t("messageForm.deliveryMethod.options.ussd")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("messageForm.content.title")}</Label>
        <Input
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder={t("messageForm.content.placeholder")}
          required
        />
      </div>

      <Button type="submit">{t("messageForm.submitButton")}</Button>
    </form>
  );
}
