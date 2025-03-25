"use client";

import { v4 as uuidv4 } from "uuid"; // Import the UUID library
import { useState, useEffect, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertBadge } from "../../components/alert-badge";
import { Alert, AlertSeverity } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from("alerts").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setAlerts(data);
      }
    };

    fetchAlerts();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          setAlerts((prev) => [...prev, payload.new as Alert]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateAlert = async (newAlert: Alert) => {
    const { data, error } = await supabase
      .from("alerts")
      .insert([newAlert])
      .select();

    if (error) {
      console.error("Error creating alert:", error);
    } else {
      setAlerts((prev) => [...prev, data[0]]);
      setIsDialogOpen(false);
    }
  };
  const msg = {
    message: "Alert Created",
    phone: ["+2348130000000"],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alert Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
            </DialogHeader>
            <AlertForm onSubmit={handleCreateAlert} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle
                  className={
                    alert.severity === "red"
                      ? "text-red-500"
                      : alert.severity === "orange"
                      ? "text-orange-500"
                      : alert.severity === "yellow"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }
                />
                {alert.title}
              </CardTitle>
              <AlertBadge severity={alert.severity} />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{alert.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span>
                  Affected Areas:{" "}
                  {alert.affected_Areas.map((a) => a.name).join(", ")}
                </span>
                <span className="text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              {alert.mediaUrls && alert.mediaUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Media URLs</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.mediaUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Media {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {alert.voiceTranscription && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Voice Transcription
                  </p>
                  <p className="text-sm">{alert.voiceTranscription}</p>
                </div>
              )}
              {alert.smsEnabled && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">SMS Enabled</p>
                  <p className="text-sm">Yes</p>
                </div>
              )}
              {alert.ussdCode && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">USSD Code</p>
                  <p className="text-sm">{alert.ussdCode}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Form component for creating a new alert
interface AlertFormProps {
  onSubmit: (alert: Alert) => void;
}

function AlertForm({ onSubmit }: AlertFormProps) {
  const [formData, setFormData] = useState<
    Omit<Alert, "id" | "timestamp" | "isActive" | "updates">
  >({
    severity: "red",
    title: "",
    description: "",
    affected_Areas: [
      {
        center: { lat: 0, lng: 0 },
        radius: 0,
        name: "",
        population: 0,
      },
    ],
    createdBy: "admin", // Default creator (can be dynamic based on logged-in user)
    mediaUrls: [],
    voiceTranscription: "",
    smsEnabled: false,
    ussdCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: Alert = {
      ...formData,
      // id: String(Math.random().toString(36).substr(2, 9)), // Generate a unique ID
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      isActive: true, // Default status
      updates: [], // Initialize with no updates
    };
    onSubmit(newAlert);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Severity</Label>
        <Select
          value={formData.severity}
          onValueChange={(value) =>
            setFormData({ ...formData, severity: value as AlertSeverity })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="green">Green</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter alert title"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter alert description"
          required
        />
      </div>

      <div>
        <Label>Affected Area Name</Label>
        <Input
          value={formData.affected_Areas[0].name}
          onChange={(e) =>
            setFormData({
              ...formData,
              affected_Areas: [
                {
                  ...formData.affected_Areas[0],
                  name: e.target.value,
                },
              ],
            })
          }
          placeholder="Enter affected area name"
          required
        />
      </div>

      <div>
        <Label>Population</Label>
        <Input
          type="number"
          value={formData.affected_Areas[0].population}
          onChange={(e) =>
            setFormData({
              ...formData,
              affected_Areas: [
                {
                  ...formData.affected_Areas[0],
                  population: Number(e.target.value),
                },
              ],
            })
          }
          placeholder="Enter population"
          required
        />
      </div>

      <div>
        <Label>Media URLs</Label>
        <Input
          value={formData.mediaUrls?.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, mediaUrls: e.target.value.split(", ") })
          }
          placeholder="Enter media URLs separated by commas"
        />
      </div>

      <div>
        <Label>Voice Transcription</Label>
        <Input
          value={formData.voiceTranscription}
          onChange={(e) =>
            setFormData({ ...formData, voiceTranscription: e.target.value })
          }
          placeholder="Enter voice transcription"
        />
      </div>

      <div>
        <Label>Enable SMS</Label>
        <Select
          value={formData.smsEnabled ? "true" : "false"}
          onValueChange={(value) =>
            setFormData({ ...formData, smsEnabled: value === "true" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Enable SMS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>USSD Code</Label>
        <Input
          value={formData.ussdCode}
          onChange={(e) =>
            setFormData({ ...formData, ussdCode: e.target.value })
          }
          placeholder="Enter USSD code"
        />
      </div>

      <Button type="submit">Create Alert</Button>
    </form>
  );
}
