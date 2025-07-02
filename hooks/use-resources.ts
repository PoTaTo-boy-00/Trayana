// hooks/use-resources.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Resource,
  ResourceHistory,
  requestResources,
  RequestStatus,
} from "@/app/types";
import { useOrgStore } from "@/store/orgStore";

interface OrgDetail {
  id: string;
  name: string;
  adminId: string;
}

interface UserDetail {
  id: string;
  name?: string;
  email?: string;
  organizationId?: string; // Add this if users belong to organizations
  // Add other user properties as needed
}

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [requestedResources, setRequestedResources] = useState<
    requestResources[]
  >([]);
  const [orgDetails, setOrgDetails] = useState<OrgDetail[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const orgID = useOrgStore((state) => state.organizationId);
  // Get user details from localStorage
  const getUserFromStorage = (): UserDetail | null => {
    try {
      const storedUser = localStorage.getItem("supabaseUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Retrieved user from localStorage:", user);
        return user;
      }
      console.warn("No user found in localStorage");
      return null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  // Initialize user details
  useEffect(() => {
    const user = getUserFromStorage();
    setUserDetails(user);
  }, []);

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

  const fetchOrgDetails = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, coverage, admin_id"); // no filtering

    if (error) {
      console.error("Error fetching organization details:", error);
      return;
    }

    setOrgDetails(
      (data || []).map((org) => ({
        id: org.id,
        name: org.name,
        coverage: org.coverage,
        adminId: org.admin_id,
      }))
    );
  };

  // Fetch requested resources - optionally filter by current user
  const fetchRequestedResources = async (filterByUser: boolean = false) => {
    let query = supabase.from("requestresources").select("*");

    // If filtering by user and user exists, add where clause
    if (filterByUser && userDetails?.id) {
      query = query.eq("requestedBy", userDetails.id);
    }
    // console.log("UD", userDetails?.id);

    const { data, error } = await query;
    if (error) console.error("Error fetching requested resources:", error);
    else setRequestedResources(data || []);
  };

  // Get requested resources by current user's organization
  const getUserRequestedResources = (): requestResources[] => {
    if (!userDetails?.organizationId && !userDetails?.id) return [];

    // If we have organization ID, filter by that
    if (userDetails.organizationId) {
      return requestedResources.filter(
        (resource) => resource.requestedBy === userDetails.organizationId
      );
    }

    // Fallback: check resource history to find resources requested by this user
    // This is less efficient but works if we don't have organizationId
    return requestedResources.filter((resource) => {
      // You might need to implement a separate query to resource_history table
      // to find resources where performed_by matches the current user ID
      return resource.organizationId === userDetails.id; // This might not be accurate
    });
  };

  // Add a new resource
  const addResource = async (
    resource: Omit<Resource, "id" | "lastUpdated">
  ) => {
    const currentUser = userDetails || getUserFromStorage();

    const newResource: Resource = {
      ...resource,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };

    const { error } = await supabase.from("resources").insert([newResource]);

    if (!error) {
      await logResourceHistory({
        resource_id: newResource.id,
        event_type: "insert",
        quantity_changed: newResource.quantity,
        status_after_event: newResource.status,
        location: `${newResource.location.lat}, ${newResource.location.lng}`,
        performed_by: currentUser?.id || currentUser?.name || "unknown",
        quantity: newResource.quantity,
      });

      // Update local state
      setResources((prev) => [...prev, newResource]);
    } else {
      console.error("Error creating resource:", error);
    }
    return !error;
  };

  // Request a new resource
  const requestResource = async (
    resource: Omit<requestResources, "id" | "lastUpdated">
  ) => {
    const currentUser = userDetails || getUserFromStorage();

    if (!currentUser) {
      console.error("User not found. Please log in again.");
      return false;
    }

    // Handle the requestedBy field based on your DB schema
    let requestedByValue: string;

    if (resource.requestedBy) {
      // If requestedBy is already provided, use it
      requestedByValue = resource.requestedBy;
    } else if (currentUser.organizationId) {
      // If user belongs to an organization, use organization ID
      requestedByValue = currentUser.organizationId;
    } else if (orgDetails.length > 0) {
      // Fallback: use the first available organization
      requestedByValue = orgDetails[0].id;
      console.warn("Using first available organization as requestedBy");
    } else {
      console.error("No valid organization found for requestedBy field");
      return false;
    }

    const newResource: requestResources = {
      ...resource,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
      requestedBy: requestedByValue,
    };

    const { error: insertError } = await supabase
      .from("requestresources")
      .insert([newResource]);

    if (insertError) {
      console.error("Error creating requested resource:", insertError);
      return false;
    }

    // Update local state
    // setRequestedResources((prev) => [...prev, newResource]);

    // Log the request with user info in resource history
    // await logResourceHistory({
    //   resource_id: newResource.id,
    //   event_type: "requested",
    //   quantity_changed: newResource.quantity,
    //   status_after_event: "pending",
    //   location: `${newResource.location.lat},${newResource.location.lng}`,
    //   performed_by: currentUser.id, // Store actual user ID here
    //   quantity: newResource.quantity,
    //   remarks: `Resource requested by user ${
    //     currentUser.name || currentUser.id
    //   } from organization ${requestedByValue}`,
    // });

    return true;
  };

  // Delete a requested resource
  const deleteRequestedResource = async (id: string) => {
    const currentUser = userDetails || getUserFromStorage();

    //  Check if user owns this request
    const resourceToDelete = requestedResources.find((res) => res.id === id);
    console.log(resourceToDelete);

    console.log(orgID);
    console.log(currentUser);
    // if (resourceToDelete && resourceToDelete.requestedBy !== currentUser?.id) {
    //   console.error("User not authorized to delete this resource request");
    //   return false;
    // }

    const { error } = await supabase
      .from("requestresources")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting requested resource:", error);
      return false;
    } else {
      setRequestedResources((prev) => prev.filter((res) => res.id !== id));

      // // Log the deletion
      // if (currentUser) {
      //   await logResourceHistory({
      //     resource_id: id,
      //     event_type: "delete",
      //     quantity_changed: 0,
      //     status_after_event: "deleted",
      //     location: resourceToDelete?.location
      //       ? `${resourceToDelete.location.lat},${resourceToDelete.location.lng}`
      //       : "unknown",
      //     performed_by: currentUser.id,
      //     quantity: 0,
      //     remarks: "Resource request deleted by user",
      //   });
      // }
    }
    return true;
  };

  // Update requested resource status
  const updateRequestedResourceStatus = async (
    id: string,
    newStatus: RequestStatus
  ) => {
    const { error } = await supabase
      .from("requestresources")
      .update({ status: newStatus, lastUpdated: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating requested resource status:", error);
      return false;
    }

    // Update local state
    setRequestedResources((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, status: newStatus, lastUpdated: new Date().toISOString() }
          : res
      )
    );

    return true;
  };

  // Set up real-time subscriptions
  useEffect(() => {
    testConnection();

    const resourcesChannel = supabase
      .channel("resources")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "resources" },
        (payload) => {
          setResources((prev) =>
            prev.map((res) =>
              res.id === payload.new.id ? (payload.new as Resource) : res
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "resources" },
        (payload) =>
          setResources((prev) =>
            prev.map((res) =>
              res.id === payload.new.id ? (payload.new as Resource) : res
            )
          )
      )
      .subscribe();

    const requestChannel = supabase
      .channel("requestresources")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requestresources" },
        (payload) =>
          setRequestedResources((prev) =>
            prev.map((res) =>
              res.id === payload.new.id
                ? (payload.new as requestResources)
                : res
            )
          )
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "requestresources" },
        (payload) =>
          setRequestedResources((prev) =>
            prev.filter((res) => res.id !== payload.old.id)
          )
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "requestresources" },
        (payload) =>
          setRequestedResources((prev) =>
            prev.map((res) =>
              res.id === payload.new.id
                ? (payload.new as requestResources)
                : res
            )
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resourcesChannel);
      supabase.removeChannel(requestChannel);
    };
  }, []);

  const logResourceHistory = async ({
    resource_id,
    event_type,
    quantity_changed,
    status_after_event,
    location,
    performed_by,
    remarks,
    quantity,
  }: Omit<ResourceHistory, "id" | "timestamp">) => {
    const { error } = await supabase.from("resource_history").insert([
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        resource_id,
        event_type,
        quantity_changed,
        status_after_event,
        location,
        performed_by,
        remarks: remarks || null,
        quantity,
      },
    ]);

    if (error) console.error("Error logging resource history:", error);
  };

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
  }, [userDetails]); // Re-run when user details change

  return {
    resources,
    requestedResources,
    orgDetails,
    userDetails,
    isLoading,
    addResource,
    requestResource,
    deleteRequestedResource,
    updateRequestedResourceStatus,
    fetchRequestedResources,

    getUserRequestedResources,
  };
};
