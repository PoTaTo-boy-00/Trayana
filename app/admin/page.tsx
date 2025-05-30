"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertBadge } from "../components/alert-badge";
import {
  Activity,
  AlertTriangle,
  Building2,
  Users,
  Brain,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DiasterPrediction,
  OptimizedAllocation,
  Resource,
  ResourceAllocation,
} from "../types";
import FloodPredictorForm from "../components/floodPrediction";
import { useTranslation } from "@/lib/translation-context";
// import { FloodPrediction } from "../components/floodPrediction";
// import { count } from "console";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [alertCount, setAlertCount] = useState<number>(0);
  const [organizationCount, setOrganizationCount] = useState<number>(0);
  const [personnelCount, setPersonnelCount] = useState<number>(0);
  const [prediction, setPrediction] = useState<DiasterPrediction | null>(null);
  const [resourceData, setResourceData] = useState<ResourceAllocation[]>([]);
  const [optimizedAllocation, setOptimizedAllocation] =
    useState<OptimizedAllocation | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from("alerts").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setAlertCount(data.length);
      }
    };

    fetchAlerts();
  }, []);
  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase.from("organizations").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setOrganizationCount(data.length);
      }
    };

    fetchOrganizations();
  }, []);
  useEffect(() => {
    const fetchPersonnel = async () => {
      const { data, error } = await supabase.from("personnel").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setPersonnelCount(data.length);
      }
    };

    fetchPersonnel();
  }, []);

  useEffect(() => {
    // Simulate AI prediction (replace with actual API call)
    setPrediction({
      disasterType: "Flood",
      probability: 0.75,
      severity: "High",
      expectedAreas: ["Jalpaiguri", "Siliguri"],
      recommendedActions: [
        "Pre-position emergency response teams",
        "Alert healthcare facilities",
        "Prepare evacuation routes",
      ],
    });

    // Simulate resource allocation data (replace with actual data)
    setResourceData([
      { date: "2025-03-10", allocated: 150 },
      { date: "2025-03-11", allocated: 280 },
      { date: "2025-03-12", allocated: 200 },
      { date: "2025-03-13", allocated: 350 },
      { date: "2025-03-14", allocated: 320 },
    ]);

    setOptimizedAllocation({
      recommendation: "Based on current trends and AI analysis:",
      suggestions: [
        "Increase medical supplies by 20%",
        "Redistribute food supplies to northern district",
        "Deploy additional personnel to high-risk areas",
      ],
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.cards.activeAlerts")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.cards.activeOrganizations")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.cards.organizationInfo")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.cards.fieldPersonnel")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnelCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.cards.personnelInfo")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.cards.systemStatus")}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("dashboard.cards.systemOperational")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.cards.allSystemsNormal")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CardTitle>{t("dashboard.floodPrediction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FloodPredictorForm />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>{t("dashboard.resourceAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="allocated"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {optimizedAllocation && (
              <div className="mt-6">
                <p className="font-medium">
                  {t("dashboard.optimizedRecommendation")}
                </p>
                <ul className="mt-2 space-y-2">
                  {optimizedAllocation.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
