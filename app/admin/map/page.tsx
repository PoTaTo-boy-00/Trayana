"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Source, Layer, LayerProps } from "react-map-gl";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MapComponent2 } from "@/components/ui/MapComponent";

import { useTranslation } from "@/lib/translation-context";

import {
  fetchOrganizations,
  organization as staticOrg,
} from "@/data/organization";
import {
  fetchReqResources,
  fetchResources,
  reqResource as staticReq,
  resource as staticRes,
} from "@/data/resource";

export default function MapPage() {
  const [organizationsData, setOrganizationsData] = useState(staticOrg);
  const [resourceData, setResourceData] = useState(staticRes);
  const [reqResourceData, setReqResourceData] = useState(staticReq);

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

  // console.log("MapPage Resource Data:", resourceData);

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
                  id: String(org.id),
                }))}
                resource={resourceData.map((res) => ({
                  ...res,
                  id: String(res.id),
                }))}
                reqResource={reqResourceData.map((req) => ({
                  ...req,
                  id: String(req.id),
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
