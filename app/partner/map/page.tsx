"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Source, Layer, LayerProps } from "react-map-gl";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Alert, Organization, Resource } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Building2, Package } from "lucide-react";
import * as turf from "@turf/turf";
import { MapComponent2 } from "@/components/ui/MapComponent";

import { useTranslation } from "@/lib/translation-context";
import {
  fetchPersonnelLocation,
  personnel as staticPersonnel,
} from "@/data/personnel";
import {
  fetchOrganizations,
  organization as staticOrg,
} from "@/data/organization";
import {
  fetchReqResources,
  fetchResources,
  reqResource,
  reqResource as staticReq,
  resource as staticRes,
} from "@/data/resource";
import { stat } from "node:fs";

export default function MapPage() {
  // const [alerts, setAlerts] = useState<Alert[]>([]);
  // const [organizations, setOrganizations] = useState<Organization[]>([]);
  // const [resources, setResources] = useState<Resource[]>([]);
  // const [personnelData, setPersonnelData] = useState(staticPersonnel);
  const [organizationsData, setOrganizationsData] = useState(staticOrg);
  const [resourceData, setResourceData] = useState(staticRes);
  const [reqResourceData, setReqResourceData] = useState(staticReq);

  // console.log(personnelData);
  // console.log(reqResourceData);

  const supabase = createClientComponentClient();

  // console.log(organizations);
  // const personnel = [
  //   {
  //     id: 1,
  //     location_lat: 26.544205506857356,
  //     location_lng: 88.70577006096832,
  //   }, // Jalpaiguri
  // ];
  const { t, language, setLanguage } = useTranslation();

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
      // await fetchPersonnelLocation();
      // setPersonnelData([...staticPersonnel]);

      // fetch organizations from Supabase
      await fetchOrganizations();
      setOrganizationsData([...staticOrg]);

      await fetchResources();
      setResourceData([...staticRes]);

      await fetchReqResources();
      setReqResourceData([...staticReq]);
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("maps.title")}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="p-0">
            <div className="h-[600px] w-full">
              <MapComponent2
                // personnel={personnelData.map((p) => ({
                //   ...p,
                //   id: typeof p.id === "string" ? Number(p.id) : p.id,
                // }))}
                // sosAlerts={sosAlerts}
                organization={organizationsData.map((org) => ({
                  ...org,
                  id: typeof org.id === "string" ? Number(org.id) : org.id,
                }))}
                resource={resourceData.map((res) => ({
                  ...res,
                  id: typeof res.id === "string" ? Number(res.id) : res.id,
                }))}
                reqResource={reqResourceData.map((req) => ({
                  ...req,
                  id: typeof req.id === "string" ? Number(req.id) : req.id,
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("maps.cardTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Active Alert</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{t("maps.legends.organizations")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span>Resource</span>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
