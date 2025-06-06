// hooks/use-resources.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Resource, requestResources } from "@/app/types";

interface OrgDetail {
  id: string;
  name: string;
}
export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [requestedResources, setRequestedResources] = useState<
    requestResources[]
  >([]);
  const [orgDetails, setOrgDetails] = useState<OrgDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Test Supabase connection
  const testConnection = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .limit(1);
    if (error) console.error("Supabase connection error:", error);
    else console.log("Supabase connection successful. Data:", data);
  };

  // Fetch all resources
  const fetchResources = async () => {
    const { data, error } = await supabase.from("resources").select("*");
    if (error) console.error("Error fetching resources:", error);
    else setResources(data || []);
  };

  // Fetch organization details
  const fetchOrgDetails = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, coverage");
    if (error) console.error("Error fetching organization details:", error);
    else {
      setOrgDetails(
        (data || []).map((org) => ({
          id: org.id,
          name: org.name,
        }))
      );
    }
  };

  // Fetch requested resources
  const fetchRequestedResources = async () => {
    const { data, error } = await supabase.from("requestresources").select("*");
    if (error) console.error("Error fetching requested resources:", error);
    else setRequestedResources(data || []);
  };

  // Add a new resource
  const addResource = async (
    resource: Omit<Resource, "id" | "lastUpdated">
  ) => {
    const newResource: Resource = {
      ...resource,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    const { error } = await supabase.from("resources").insert([newResource]);
    if (error) console.error("Error creating resource:", error);
    return !error;
  };

  // Request a new resource
  const requestResource = async (
    resource: Omit<requestResources, "id" | "lastUpdated">
  ) => {
    const newResource: requestResources = {
      ...resource,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("requestresources")
      .insert([newResource]);
    if (error) console.error("Error creating requested resource:", error);
    return !error;
  };

  // Delete a requested resource
  const deleteRequestedResource = async (id: string) => {
    const { error } = await supabase
      .from("requestresources")
      .delete()
      .eq("id", id);
    if (error) console.error("Error deleting requested resource:", error);
    else setRequestedResources((prev) => prev.filter((res) => res.id !== id));
    return !error;
  };

  // Set up real-time subscriptions
  useEffect(() => {
    testConnection();

    const resourcesChannel = supabase
      .channel("resources")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "resources" },
        (payload) => setResources((prev) => [...prev, payload.new as Resource])
      )
      .subscribe();

    const requestChannel = supabase
      .channel("requestresources")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requestresources" },
        (payload) =>
          setRequestedResources((prev) => [
            ...prev,
            payload.new as requestResources,
          ])
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "requestresources" },
        (payload) =>
          setRequestedResources((prev) =>
            prev.filter((res) => res.id !== payload.old.id)
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resourcesChannel);
      supabase.removeChannel(requestChannel);
    };
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchResources(),
        fetchOrgDetails(),
        fetchRequestedResources(),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return {
    resources,
    requestedResources,
    orgDetails,
    isLoading,
    addResource,
    requestResource,
    deleteRequestedResource,
  };
};
