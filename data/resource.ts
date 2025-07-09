// hooks/useOrganizations.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Organization } from "@/app/types";
import { jitter } from "@/lib/jitter";

export interface ResourceWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
  name?: string;
  resource_type?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  expiryDate?: string;
}

export const resource: ResourceWithCoords[] = [];
export const reqResource: ResourceWithCoords[] = [];

export const fetchResources = async () => {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "available");

  if (error) {
    console.error("Error fetching resources:", error.message);
    return [];
  }

  const processed = (data || []).map((res) => {
    return {
      id: res.id,
      type: "resource",
      location_lat: res.location?.lat + jitter(),
      location_lng: res.location?.lng + jitter(),
      name: res.name,
      resource_type: res.type,
      quantity: res.quantity,
      unit: res.unit,
      status: res.status,
      expiryDate: res.expiry_date,
      // Add other resource properties as needed
    };
  });
  resource.splice(0, resource.length, ...processed);
};

export const fetchReqResources = async () => {
  const { data, error } = await supabase
    .from("requestresources")
    .select("*")
    .eq("status", "requested");

  if (error) {
    console.error("Error fetching requested resources:", error.message);
    return;
  }
  const processed = (data || []).map((req) => {
    return {
      id: req.id,
      location_lat: req.location?.lat + jitter(),
      location_lng: req.location?.lng + jitter(),
      name: req.name,
      resource_type: req.type,
      quantity: req.quantity,
      unit: req.unit,
      status: req.status,
      expiryDate: req.expiry_date,
      requestedBy: req.requested_by,
      urgency: req.urgency,
      // Add other requested resource properties as needed
    };
  });
  reqResource.splice(0, reqResource.length, ...processed);
};
