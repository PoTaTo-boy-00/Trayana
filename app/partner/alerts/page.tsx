"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertBadge } from "../../components/alert-badge";
import { Alert } from "@/app/types";

import { supabase } from "@/lib/supabase";
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from("alerts").select("*");

      if (error) {
        console.error("Error fetching alerts:", error.message);
      } else {
        setAlerts(data || []);
      }
    };

    fetchAlerts();

    // Subscribe to realtime updates
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

    // Cleanup function to remove the subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Active Alerts</h1>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle
                  className={
                    alert.severity === "red"
                      ? "text-red-500"
                      : "text-yellow-500"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
