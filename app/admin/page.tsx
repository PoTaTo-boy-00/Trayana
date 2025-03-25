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
// import { count } from "console";

export default function AdminDashboard() {
  const [alertCount, setAlertCount] = useState<number>(0);
  const [organizationCount, setOrganizationCount] = useState<number>(0);
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
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
            {/* <div className="flex gap-2 mt-2">
              <AlertBadge severity="red" />
              <AlertBadge severity="orange" />
              <AlertBadge severity="yellow" />
              <AlertBadge severity="green" />
            </div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">Across 6 categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Field Personnel
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Operational</div>
            <p className="text-xs text-muted-foreground">All systems normal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>AI Disaster Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            {prediction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Predicted Event
                    </p>
                    <p className="text-xl font-semibold">
                      {prediction.disasterType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Probability</p>
                    <p className="text-xl font-semibold">
                      {(prediction.probability * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Expected Areas
                  </p>
                  <div className="flex gap-2 mt-1">
                    {prediction.expectedAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2 py-1 bg-secondary rounded-full text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Recommended Actions
                  </p>
                  <ul className="mt-2 space-y-2">
                    {prediction.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Resource Allocation Analysis</CardTitle>
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
                  {optimizedAllocation.recommendation}
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
