"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Source, Layer, LayerProps } from "react-map-gl";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Alert, Organization, Resource } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Building2, Package } from "lucide-react";
import * as turf from "@turf/turf";
import { MapComponent2 } from "@/components/ui/MapComponent";
import { personnel } from "@/data/personnel";
import { sosAlerts } from "@/data/sos";
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
  const [organizationsData, setOrganizationsData] = useState(staticOrg);
  const [resourceData, setResourceData] = useState(staticRes);
  const [reqResourceData, setReqResourceData] = useState(staticReq);

  const supabase = createClientComponentClient();

  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    async function fetchData() {
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
      </div>
    </div>
  );
}
