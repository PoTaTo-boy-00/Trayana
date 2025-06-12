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
import {
  fetchSOS,
  sosReport,
  SOSWithCoords,
  sosReport as staticSOS,
} from "@/data/sos";
import { useTranslation } from "@/lib/translation-context";

//Easter Egg

export default function PartnerDashboard() {
  const [alertCount, setAlertCount] = useState<number>(0);
  const [resourceCount, setResourceCount] = useState<number>(0);
  const [personnelCount, setPersonnelCount] = useState<number>(0);
<<<<<<< HEAD
=======
  const [organizationId, setOrganizationId] = useState<string | "">("");
  const { t } = useTranslation();
>>>>>>> deletebutton

  const [personnelData, setPersonnelData] = useState(staticPersonnel);
  const [SOSdata, setSOSData] = useState<SOSWithCoords[]>([]);
  const [organizationId, setOrganizationId] = useState<string | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

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
    const fetchResource = async () => {
      const { data, error } = await supabase.from("resources").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setResourceCount(data.length);
      }
    };

    fetchResource();
  }, []);

  useEffect(() => {
    const fetchPersonnel = async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("*")
        .eq("organization_id", organizationId);

      // console.log(otrga)
      // console.log(data);
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setPersonnelCount(data.length);
      }
    };

    fetchPersonnel();
  }, [organizationId]);

  useEffect(() => {
    const fetchUserAndPersonnel = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        // console.log(user);

        if (userError || !user) throw new Error("User not logged in");

        // Fetch organization_id of the user
        const { data: userDetails, error: userDetailsError } = await supabase
          .from("users")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        // console.log(userDetails?.organization_id);

        if (userDetailsError || !userDetails)
          throw new Error("Failed to fetch user details");
        setOrganizationId(userDetails.organization_id);
      } catch (err) {
        console.error("Error fetching user and personnel:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPersonnel();
  }, [organizationId]);

  console.log(organizationId);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      await fetchPersonnelLocation(organizationId);
      setPersonnelData([...staticPersonnel]);
      await fetchSOS();
      setSOSData([...sosReport]);

      console.log("SOSdata ", SOSdata);
      setLoading(false);
    }
    fetchData();
  }, [organizationId]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("partnerPage.components.dashboard.title")}</h1>

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
