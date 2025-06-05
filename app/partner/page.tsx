"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertBadge } from "../components/alert-badge";
import {
  Activity,
  AlertTriangle,
  Box,
  Users,
  MapPin,
  AlertCircle,
} from "lucide-react";
import Map, { Marker } from "react-map-gl";
import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabase";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PersonnelLocation, SOSAlert } from "../types";
import { MapComponent } from "@/components/ui/MapComponent";
import {
  fetchPersonnelLocation,
  personnel as staticPersonnel,
} from "@/data/personnel";
import { fetchSOS, sosReport as staticSOS } from "@/data/sos";

//Easter Egg

export default function PartnerDashboard() {
  const [alertCount, setAlertCount] = useState<number>(0);
  const [resourceCount, setResourceCount] = useState<number>(0);
  const [personnelCount, setPersonnelCount] = useState<number>(0);

  const [personnelData, setPersonnelData] = useState(staticPersonnel);
  const [SOSdata, setSOSData] = useState(staticSOS);

  const supabase = createClientComponentClient();
  // const personnel = [
  //   {
  //     id: 1,
  //     location_lat: 26.544205506857356,
  //     location_lng: 88.70577006096832,
  //   }, // Jalpaiguri
  // ];

  const sosAlerts = [
    { id: 1, location_lat: 26.54, location_lng: 88.71 }, // Near Jalpaiguri
  ];

  useEffect(() => {
    async function fetchData() {
      // Fetch alerts
      // const { data: alertsData } = await supabase
      //   .from("alerts")
      //   .select("*")
      //   .eq("is_active", true);

      // if (alertsData) {
      //   setAlerts(
      //     alertsData.map((alert) => ({
      //       ...alert,
      //       affected_Areas: alert.affected_areas as any,
      //     }))
      //   );
      // }

      // Fetch organizations
      // const { data: orgsData } = await supabase
      //   .from("organizations")
      //   .select("*")
      //   .eq("status", "active");

      // if (orgsData) {
      //   setOrganizations(
      //     orgsData.map((org) => ({
      //       ...org,
      //       coverage: {
      //         center: { lat: org.coverage_lat, lng: org.coverage_lng },
      //         // radius: org.coverage_radius,
      //       },
      //     }))
      //   );
      // }

      // Fetch resources
      // const { data: resourcesData } = await supabase
      //   .from("resources")
      //   .select("*")
      //   .eq("status", "available");

      // if (resourcesData) {
      //   setResources(
      //     resourcesData.map((resource) => ({
      //       ...resource,
      //       location: {
      //         lat: resource.location_lat,
      //         lng: resource.location_lng,
      //       },
      //     }))
      //   );
      // }

      // fetch personnel from Supabase
      await fetchPersonnelLocation();
      setPersonnelData([...staticPersonnel]);
      // await fetchSOSLocation();
      setSOSData([...staticSOS]);

      // fetch organizations from Supabase
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Partner Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
            <div className="flex gap-2 mt-2">
              <AlertBadge severity="red" />
              <AlertBadge severity="orange" />
              <AlertBadge severity="yellow" />
              <AlertBadge severity="green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Resources
            </CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceCount}</div>
            <p className="text-xs text-muted-foreground">Across 4 categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Personnel
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnelCount}</div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Organization Status
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>
      <MapComponent
        personnel={personnelData.map((p) => ({
          ...p,
          id: typeof p.id === "string" ? Number(p.id) : p.id,
        }))}
        sosAlerts={SOSdata.map((p) => ({
          ...p,
          id: typeof p.id === "string" ? Number(p.id) : p.id,
        }))}
        // sosAlerts={sosAlerts}
      />
    </div>
  );
}
