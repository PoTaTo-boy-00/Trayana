"use client";

import { v4 as uuidv4 } from "uuid"; // Import the UUID library
import { useState, useEffect, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
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
import { useTranslation } from "@/lib/translation-context";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
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
          setAlerts((prev) => {
            const exists = prev.find((a) => a.id === (payload.new as Alert).id);
            return exists ? prev : [...prev, payload.new as Alert];
          });
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

  const { t, language } = useTranslation();
  // console.log(language);

  const [translatedAlerts, setTranslatedAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const translateAlerts = async () => {
      const translated = await Promise.all(
        alerts.map(async (alert) => {
          if (language === "en") return alert; // No need to translate if English

          try {
            const [titleRes, descRes] = await Promise.all([
              axios.post("/api/translate", {
                text: alert.title,
                targetLang: language,
              }),

              axios.post("/api/translate", {
                text: alert.description,
                targetLang: language,
              }),
            ]);

            return {
              ...alert,
              title: titleRes.data.translatedText || alert.title,
              description: descRes.data.translatedText || alert.description,
            };
          } catch (error) {
            console.error("Translation error:", error);
            return alert; // Return original alert if translation fails
          }
        })
      );
      setTranslatedAlerts(translated);
    };

    if (alerts.length > 0) {
      translateAlerts();
    }
  }, [alerts, language]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("alert.title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("alert.button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("alert.dialogTitle")}</DialogTitle>
            </DialogHeader>
            <AlertForm onSubmit={handleCreateAlert} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {translatedAlerts.map((alert) => (
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
                  {t("alertForm.location.title")}:{" "}
                  {alert.affected_Areas.map((a) => a.name).join(", ")}
                </span>
                <span className="text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              {alert.mediaUrls && alert.mediaUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t("alert.mediaUrls")}
                  </p>
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
                    {t("alert.voiceTranscriptions")}
                  </p>
                  <p className="text-sm">{alert.voiceTranscription}</p>
                </div>
              )}
              {alert.smsEnabled && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t("alert.smsEnabled.title")}
                  </p>
                  <p className="text-sm">{t("alert.smsEnabled.yes")}</p>
                </div>
              )}
              {alert.ussdCode && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t("alert.ussdCode")}
                  </p>
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
  const { t } = useTranslation();
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div>
        <Label>{t("alertForm.label")}</Label>
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
            <SelectItem value="red">
              {t("alertForm.severity.options.red")}
            </SelectItem>
            <SelectItem value="orange">
              {t("alertForm.severity.options.orange")}
            </SelectItem>
            <SelectItem value="yellow">
              {t("alertForm.severity.options.yellow")}
            </SelectItem>
            <SelectItem value="green">
              {t("alertForm.severity.options.green")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("alertForm.alertTitle.title")}</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t("alertForm.alertTitle.placeholder")}
          required
        />
      </div>

      <div>
        <Label>{t("alertForm.alertDescription.title")}</Label>
        <Input
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder={t("alertForm.alertDescription.placeholder")}
          required
        />
      </div>

      <div>
        <Label>{t("alertForm.location.title")}</Label>
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
          placeholder={t("alertForm.location.placeholder")}
          required
        />
      </div>

      <div>
        <Label>{t("alertForm.population.title")}</Label>
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
          placeholder={t("alertForm.population.placeholder")}
          required
        />
      </div>

      <div>
        <Label>{t("alertForm.mediaUrls.title")}</Label>
        <Input
          value={formData.mediaUrls?.join(", ")}
          onChange={(e) =>
            setFormData({ ...formData, mediaUrls: e.target.value.split(", ") })
          }
          placeholder={t("alertForm.mediaUrls.placeholder")}
        />
      </div>

      <div>
        <Label>{t("alertForm.voiceTransciptions.title")}</Label>
        <Input
          value={formData.voiceTranscription}
          onChange={(e) =>
            setFormData({ ...formData, voiceTranscription: e.target.value })
          }
          placeholder={t("alertForm.voiceTransciptions.placeholder")}
        />
      </div>

      <div>
        <Label>{t("alertForm.enableSMS.title")}</Label>
        <Select
          value={formData.smsEnabled ? "true" : "false"}
          onValueChange={(value) =>
            setFormData({ ...formData, smsEnabled: value === "true" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("alertForm.enableSMS.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">{t("alertForm.enableSMS.yes")}</SelectItem>
            <SelectItem value="false">{t("alertForm.enableSMS.no")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("alertForm.ussdCode.title")}</Label>
        <Input
          value={formData.ussdCode}
          onChange={(e) =>
            setFormData({ ...formData, ussdCode: e.target.value })
          }
          placeholder={t("alertForm.ussdCode.placeholder")}
        />
      </div>

      <Button type="submit">{t("alertForm.submitButton")}</Button>
    </form>
  );
}
