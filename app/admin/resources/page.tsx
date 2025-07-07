"use client";

import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { Package, ArrowUpDown, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestResources, Resource } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { set } from "date-fns";
import { getReadableAddress } from "@/data/geoLocation";
import { useTranslation } from "@/lib/translation-context";
import { useResources } from "@/hooks/use-resources";
import { getDistance } from "geolib";
import { toast } from "@/hooks/use-toast";

export default function ResourcesPage() {
  const [selectedRequest, setSelectedRequest] =
    useState<requestResources | null>(null);
  const [allocateQuantity, setAllocateQuantity] = useState<number>(0);
  const [isAllocDialogOpen, setIsAllocDialogOpen] = useState(false);

  const [resources, setResources] = useState<Resource[]>([]);
  const [requestResource, setRequestResources] = useState<requestResources[]>(
    []
  );
  const [orgNames, setOrgNames] = useState<Record<string, string>>({});

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllocating, setIsAllocating] = useState(false);
  const { orgDetails } = useResources();

  const { t } = useTranslation();

  const prirotyRank = { high: 1, normal: 2, low: 3 };

  const sortedResources = [...requestResource].sort((a, b) => {
    const urgencyDiff = prirotyRank[a.urgency] - prirotyRank[b.urgency];
    if (urgencyDiff !== 0) {
      return urgencyDiff;
    } else {
      return (
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
      );
    }
  });
  // useEffect(() => {
  //   const fetchOrgNames = async () => {
  //     const orgIds = [
  //       ...Array.from(new Set(resources.map((r) => r.organizationId))),
  //     ].filter(Boolean);

  //     if (orgIds.length === 0) return;

  //     const { data, error } = await supabase
  //       .from("organizations")
  //       .select("id, name")
  //       .in("id", orgIds);

  //     if (error) {
  //       console.error("Error fetching org names:", error);
  //       return;
  //     }

  //     const nameMap: Record<string, string> = {};
  //     data.forEach((org) => {
  //       nameMap[org.id] = org.name;
  //     });

  //     setOrgNames(nameMap);
  //     console.log("Org names fetched:", nameMap);
  //   };

  //   fetchOrgNames();
  // }, [resources]);

  console.log(sortedResources);
  useEffect(() => {
    const fetchData = async () => {
      const [resourceRes, requestRes, orgRes] = await Promise.all([
        supabase.from("resources").select("*"),
        supabase.from("requestresources").select("*"),
        supabase.from("organizations").select("id, name"),
      ]);

      if (resourceRes.error || requestRes.error || orgRes.error) {
        console.error(
          "Fetch error:",
          resourceRes.error || requestRes.error || orgRes.error
        );
        return;
      }
      // console.log(orgRes.data, "orgRes.data");
      // Create a lookup map for org id -> name
      const orgNameMap = new Map(
        (orgRes.data || []).map((org) => [org.id, org.name])
      );

      // Enrich each resource with org name
      const enrichedResources = (resourceRes.data || []).map((res) => ({
        ...res,
        organizationName:
          orgNameMap.get(res.organizationId) || "Unknown Organization",
      }));

      setResources(enrichedResources);
      setRequestResources(requestRes.data || []);
    };

    fetchData();
  }, []);
  console.log("resourceserrrrr", resources);
  const handleAddResource = async (newResource: Resource) => {
    const { data, error } = await supabase
      .from("resources")
      .insert([newResource])
      .select();
    if (error) {
      console.error("Error creating alert:", error);
    } else {
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    const channel = supabase.channel("resources");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "resources" },

      // NEW THING ADDED IF THE SYSTEM BREAK THEN REMOVE THIS WITH
      /**
       * Reaplace
       * 
       * setResources((prev) => {
          const exists = prev.find(
            (a) => a.id === (payload.new as Resource).id
          );
          return exists ? prev : [...prev, payload.new as Resource];
        });
       * with
       * this
       *  setResources((prev) => [...prev, payload.new as Resource]);
       * 
       */

      (payload) => {
        setResources((prev) => {
          const exists = prev.find(
            (a) => a.id === (payload.new as Resource).id
          );
          return exists ? prev : [...prev, payload.new as Resource];
        });
      }
    );

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "resources" },
      (payload) => {
        setResources((prev) =>
          prev.map((r) =>
            r.id === payload.new.id ? (payload.new as Resource) : r
          )
        );
      }
    );

    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "resources" },
      (payload) => {
        setResources((prev) =>
          prev.filter((r) => r.id !== (payload.old as Resource).id)
        );
      }
    );
    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") {
        console.warn("Subscription failed or not yet established:", status);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase.channel("requestresources");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "requestresources" },
      (payload) => {
        setRequestResources((prev) => [
          ...prev,
          payload.new as requestResources,
        ]);
      }
    );
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "requestresources" },
      (payload) => {
        setRequestResources((prev) =>
          prev.map((r) =>
            r.id === payload.new.id ? (payload.new as requestResources) : r
          )
        );
      }
    );

    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "requestresources" },
      (payload) => {
        setRequestResources((prev) =>
          prev.filter((r) => r.id !== (payload.old as requestResources).id)
        );
      }
    );

    // channel.subscribe();

    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") {
        console.warn("Subscription failed or not yet established:", status);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteResource = async (id: string) => {
    setIsLoading(true);

    try {
      // Fetch current resource details
      const { data: resourceData, error: fetchError } = await supabase
        .from("resources")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !resourceData) {
        console.error("Failed to fetch resource before delete:", fetchError);
        return;
      }

      //  Soft-delete the resource
      const { error: deleteError } = await supabase
        .from("resources")
        .update({ is_deleted: true })
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting resource:", deleteError);
        return;
      }

      // 3. Log to resource_history
      const { error: historyError } = await supabase
        .from("resource_history")
        .insert([
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            event_type: "delete",
            quantity_changed: -resourceData.quantity,
            quantity: 0,
            status_after_event: "deleted",
            location: `${resourceData.location.lat}, ${resourceData.location.lng}`,
            performed_by: "admin",
            remarks: `Resource ${resourceData.name} was deleted.`,
            resource_id: resourceData.id,
          },
        ]);

      if (historyError) {
        console.error("Error inserting into resource history:", historyError);
      }

      // 4. Update local state
      setResources((prev) => prev.filter((res) => res.id !== id));
    } catch (err) {
      console.error("Unexpected error during deletion:", err);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("resources.title")}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> {t("resources.filter")}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t("resources.btnName")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("resource.formTitle")}</DialogTitle>
              </DialogHeader>

              <ResourceForm onSubmit={handleAddResource} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {resources
          .filter((res) => !res.is_deleted)
          .map((resource) => (
            <Card key={resource.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {resource.name}
                </CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    resource.status === "available"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : resource.status === "allocated"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {resource.status.charAt(0).toUpperCase() +
                    resource.status.slice(1)}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteResource(resource.id)}
                >
                  Delete
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ResourcesCard.type")}
                    </p>
                    <p className="font-medium">{resource.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ResourcesCard.quantity")}
                    </p>
                    <p className="font-medium">
                      {resource.quantity} {resource.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ResourcesCard.location")}
                    </p>
                    <p className="font-medium">
                      {resource.location.lat}, {resource.location.lng}
                    </p>
                  </div>

                  {resource.conditions && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">
                        {t("ResourcesCard.conditions")}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {resource.conditions.map((condition) => (
                          <span
                            key={`${resource.id}-${condition}`}
                            className="px-2 py-1 bg-secondary rounded-full text-xs"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resource.expiryDate && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">
                        {t("ResourcesCard.expiryDate")}
                      </p>
                      <p className="font-medium">{resource.expiryDate}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      <div>Requested Resources</div>
      <div className="grid gap-4">
        {sortedResources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                {resource.name}
              </CardTitle>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  resource.status === "requested"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : resource.status === "allocated"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}
              >
                {resource.status.charAt(0).toUpperCase() +
                  resource.status.slice(1)}
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ResourcesCard.type")}
                  </p>
                  <p className="font-medium">{resource.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ResourcesCard.quantity")}
                  </p>
                  <p className="font-medium">
                    {resource.quantity} {resource.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ResourcesCard.location")}
                  </p>
                  <p className="font-medium">
                    {resource.location.lat}, {resource.location.lng}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ResourcesCard.status")}
                  </p>
                  <p className="font-medium">{resource.status}</p>
                </div>
                {resource.conditions && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t("ResourcesCard.conditions")}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {resource.conditions.map((condition) => (
                        <span
                          key={condition}
                          className="px-2 py-1 bg-secondary rounded-full text-xs"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {resource.expiryDate && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t("ResourcesCard.expiryDate")}
                    </p>
                    <p className="font-medium">{resource.expiryDate}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ResourcesCard.requestedBy")}
                  </p>
                  <p className="font-medium">
                    {orgDetails.find(
                      (org) => org.id === resource.organizationId
                    )?.name || "Unknown Organization"}
                  </p>
                </div>
              </div>
              {resources.some(
                (res) =>
                  res.name === resource.name &&
                  res.type === resource.type &&
                  res.quantity > 0
              ) ? (
                <Button
                  onClick={() => {
                    setSelectedRequest(resource);
                    setIsAllocDialogOpen(true);
                  }}
                  disabled={resource.status === "allocated"}
                >
                  {t("ResourcesCard.allocateResources")}
                </Button>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> {t("resources.btnName")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("resources.formTitle")}</DialogTitle>
                    </DialogHeader>

                    <ResourceForm onSubmit={handleAddResource} />
                  </DialogContent>
                </Dialog>
              )}

              <Dialog
                open={isAllocDialogOpen}
                onOpenChange={setIsAllocDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("allocateResourceForm.Allocate_Resource")}
                    </DialogTitle>
                  </DialogHeader>
                  {selectedRequest && (
                    <div className="space-y-4">
                      <p>
                        {t("allocateResourceForm.Request_for")}{" "}
                        <strong>{selectedRequest.name}</strong> (
                        {selectedRequest.quantity} {selectedRequest.unit})
                      </p>

                      {/* Improved matching logic */}
                      {(() => {
                        const matchingResources = resources.filter(
                          (res) =>
                            res.name?.toLowerCase() ===
                              selectedRequest.name?.toLowerCase() &&
                            res.type?.toLowerCase() ===
                              selectedRequest.type?.toLowerCase()
                        );

                        const totalAvailable = matchingResources.reduce(
                          (sum, res) => sum + res.quantity,
                          0
                        );
                        const maxAllocatable = Math.min(
                          selectedRequest.quantity,
                          totalAvailable
                        );
                        console.log("ma", matchingResources);

                        return (
                          <>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                              <p>
                                Matching resources found:{" "}
                                {matchingResources.length}
                              </p>
                              <p>
                                Total available: {totalAvailable}{" "}
                                {selectedRequest.unit}
                              </p>
                              {matchingResources.map((res, idx) => (
                                <p key={idx}>
                                  - {res.name} (From: {res.organizationName}){" "}
                                  {res.quantity} {res.unit}-{" "}
                                  {(
                                    getDistance(
                                      {
                                        latitude: res.location.lat,
                                        longitude: res.location.lng,
                                      },
                                      {
                                        latitude: selectedRequest.location.lat,
                                        longitude: selectedRequest.location.lng,
                                      }
                                    ) / 1000
                                  ).toFixed(2)}
                                  {" km away"}
                                </p>
                              ))}
                            </div>

                            <div>
                              <Label>
                                {t("allocateResourceForm.Allocate_Quantity")}
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                max={maxAllocatable}
                                value={allocateQuantity}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  setAllocateQuantity(
                                    Math.min(value, maxAllocatable)
                                  );
                                }}
                              />
                              <p className="text-sm text-muted-foreground mt-1">
                                {t("allocateResourceForm.Available")}:{" "}
                                {totalAvailable} {selectedRequest.unit}
                                <br />
                                {t("Maximum_Allocatable_Quantity")}:{" "}
                                {maxAllocatable} {selectedRequest.unit}
                              </p>
                            </div>

                            <Button
                              onClick={async () => {
                                if (
                                  !allocateQuantity ||
                                  allocateQuantity <= 0
                                ) {
                                  toast.error({
                                    title:
                                      "Please enter a valid allocation quantity",
                                  });
                                  return;
                                }

                                setIsAllocating(true); // start loading
                                try {
                                  // Sort matching resources by distance
                                  const sortedResources = [
                                    ...matchingResources,
                                  ].sort((a, b) => {
                                    const distA = getDistance(
                                      a.location,
                                      selectedRequest.location
                                    );
                                    const distB = getDistance(
                                      b.location,
                                      selectedRequest.location
                                    );
                                    return distA - distB;
                                  });

                                  let remainingAllocation = allocateQuantity;
                                  const allocatedResources = [];

                                  // Process each matching resource
                                  for (const resource of sortedResources) {
                                    if (remainingAllocation <= 0) break;

                                    const allocationAmount = Math.min(
                                      remainingAllocation,
                                      resource.quantity
                                    );
                                    remainingAllocation -= allocationAmount;
                                    allocatedResources.push({
                                      resource,
                                      allocationAmount,
                                    });

                                    // Update resource quantity
                                    const newQuantity =
                                      resource.quantity - allocationAmount;
                                    await supabase
                                      .from("resources")
                                      .update({
                                        quantity: newQuantity,
                                        status:
                                          newQuantity <= 0
                                            ? "depleted"
                                            : "available",
                                      })
                                      .eq("id", resource.id);

                                    // Add to history
                                    await supabase
                                      .from("resource_history")
                                      .insert({
                                        id: crypto.randomUUID(),
                                        resource_id: resource.id,
                                        event_type: "allocation",
                                        quantity_changed: -allocationAmount,
                                        quantity: newQuantity,
                                        status_after_event:
                                          newQuantity <= 0
                                            ? "depleted"
                                            : "available",
                                        timestamp: new Date().toISOString(),
                                        remarks: `Allocated to request ${selectedRequest.id}`,
                                      });
                                  }
                                  // Update the request
                                  const newRequestQuantity =
                                    selectedRequest.quantity - allocateQuantity;
                                  if (newRequestQuantity <= 0) {
                                    await supabase
                                      .from("requestresources")
                                      .delete()
                                      .eq("id", selectedRequest.id);
                                  } else {
                                    await supabase
                                      .from("requestresources")
                                      .update({
                                        quantity: newRequestQuantity,
                                        status: "partially_allocated",
                                      })
                                      .eq("id", selectedRequest.id);
                                  }
                                  // const { data, error } = await supabase
                                  //   .from("resources")
                                  //   .select("*, organizations(name)");
                                  // console.log("JOIN DATA", data);
                                  //Something diff
                                  const { data: Res, error: er } =
                                    await supabase
                                      .from("organizations")
                                      .select("name")
                                      .eq("id", selectedRequest.organizationId);
                                  // if (
                                  //   Res &&
                                  //   Array.isArray(Res) &&
                                  //   Res.length > 0
                                  // ) {
                                  //   console.log("SINGLE DATA", Res[0].name);
                                  // } else {
                                  //   console.log(
                                  //     "SINGLE DATA: No organization found"
                                  //   );
                                  // }
                                  //This should be a Transaction but for now we will do it like this
                                  // Create notifications
                                  const notificationId = crypto.randomUUID();
                                  const currentTimestamp =
                                    new Date().toISOString();

                                  // Notification for requester
                                  const requesterNotification = {
                                    id: notificationId,
                                    recipient_id:
                                      selectedRequest.organizationId ||
                                      selectedRequest.requestedBy,
                                    message: `You received ${allocateQuantity} ${selectedRequest.unit} of ${selectedRequest.name}`,
                                    type: "resource_allocated",
                                    read: false,
                                    timestamp: currentTimestamp,
                                    // org_id: selectedRequest.organizationId,
                                  };
                                  const cleanUUID = (uuid: string | null) => {
                                    if (!uuid) return null;
                                    return uuid.trim().replace(/\s+/g, "");
                                  };
                                  // Notifications for each donor
                                  const donorNotifications =
                                    allocatedResources.map(
                                      ({ resource, allocationAmount }) => ({
                                        id: crypto.randomUUID(),
                                        recipient_id: cleanUUID(
                                          resource.organizationId
                                        ),
                                        message: `${allocationAmount} ${
                                          resource.unit
                                        } of ${
                                          resource.name
                                        } was allocated to ${
                                          Res &&
                                          Array.isArray(Res) &&
                                          Res.length > 0
                                            ? Res[0].name
                                            : "Unknown Organization"
                                        }'s request`,
                                        type: "resource_donated",
                                        read: false,
                                        timestamp: currentTimestamp,
                                        // org_id: resource.organizationId,
                                      })
                                    );
                                  console.log(
                                    "Notification payload:",
                                    JSON.stringify(
                                      [
                                        requesterNotification,
                                        ...donorNotifications,
                                      ],
                                      null,
                                      2
                                    )
                                  );
                                  await supabase
                                    .from("notifications")
                                    .insert([
                                      requesterNotification,
                                      ...donorNotifications,
                                    ]);

                                  toast.success({
                                    title: `Successfully allocated ${allocateQuantity} ${selectedRequest.unit}`,
                                    description: `Resources have been allocated to the request from ${
                                      Res &&
                                      Array.isArray(Res) &&
                                      Res.length > 0
                                        ? Res[0].name
                                        : "Unknown Organization"
                                    }`,
                                  });
                                  setIsAllocDialogOpen(false);
                                  setAllocateQuantity(0);
                                } catch (error) {
                                  console.error("Allocation failed:", error);
                                  toast.error({
                                    title:
                                      "Allocation failed. Please try again.",
                                  });
                                } finally {
                                  setIsAllocating(false); // stop loading
                                }
                              }}
                              disabled={
                                !allocateQuantity ||
                                allocateQuantity <= 0 ||
                                allocateQuantity > maxAllocatable
                              }
                            >
                              {isAllocating
                                ? "Allocating..."
                                : t("allocateResourceForm.Confirm_Allocation")}
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Form component for adding a new resource
interface ResourceFormProps {
  onSubmit: (resource: Resource) => void;
}

function ResourceForm({ onSubmit }: ResourceFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<
    Omit<Resource, "id" | "lastUpdated">
  >({
    type: "food",
    name: "",
    quantity: 0,
    unit: "",
    location: { lat: 28.855, lng: 77.1025 }, // Default to Delhi coordinates
    status: "available",
    organizationId: "",
    expiryDate: "",
    conditions: [],
    // priority: "medium",
    // disasterType: "other",
  });

  const [address, setAddress] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.quantity <= 0 || !formData.unit) {
      toast.error({ title: "Please fill in all required fields" });
      return;
    }

    const newResource: Resource = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
      lastUpdated: new Date().toISOString(),
    };
    onSubmit(newResource);
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error({ title: "Geolocation is not supported by your browser" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Only fetch once from the API
        try {
          const readable = await getReadableAddress(latitude, longitude);
          setFormData((prev) => ({
            ...prev,
            location: { lat: latitude, lng: longitude },
          }));
          setAddress(readable);
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          setAddress("Could not fetch address");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error({ title: "Could not get your location" });
      },
      {
        enableHighAccuracy: true, // key fix
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div>
        <Label>{t("resourceForm.name")}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>{t("resourceForm.type.title")}</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as Resource["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">
              {t("resourceForm.type.options.food")}
            </SelectItem>
            <SelectItem value="medicine">
              {t("resourceForm.type.options.medicine")}
            </SelectItem>
            <SelectItem value="shelter">
              {t("resourceForm.type.options.shelter")}
            </SelectItem>
            <SelectItem value="equipment">
              {t("resourceForm.type.options.equipment")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("resourceForm.quantity")}</Label>
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: Number(e.target.value) })
          }
          required
        />
      </div>

      <div>
        <Label>{t("resourceForm.unit")}</Label>
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          required
        />
      </div>

      <div className="flex flex-col">
        <Label>{t("resourceForm.location")}</Label>
        <div className="flex flex-col gap-1 mt-1">
          <Button type="button" onClick={detectLocation} className="w-fit">
            {t("resourceForm.detect_location")}
          </Button>
          <p className="text-sm text-muted-foreground">
            {address || t("resourceForm.locStatement")}
          </p>
        </div>
      </div>

      <div>
        <Label>{t("resourceForm.expiryDate")}</Label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
        />
      </div>

      <div>
        <Label>{t("resourceForm.conditions.title")}</Label>
        <Input
          value={formData.conditions?.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: e.target.value.split(", "),
            })
          }
          placeholder={t("resourceForm.conditions.placeholder")}
        />
      </div>

      <div className="lg:col-span-3 md:col-span-2 col-span-1 pt-2">
        <Button type="submit" className="mt-2">
          {t("resourceForm.submitButton")}
        </Button>
      </div>
    </form>
  );
}
