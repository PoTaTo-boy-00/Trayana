"use client";

import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { Package, ArrowUpDown, Filter, Plus, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allocateResource, requestResources, Resource } from "@/app/types";
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

interface orgDetail {
  id: string;
  name: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [requestResource, setRequestResources] = useState<requestResources[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReqDialogOpen, setIsReqDialogOpen] = useState(false);
  const [orgId, setOrgId] = useState<orgDetail[]>([]);
  // const [orgName, setOrgName] = useState<orgDetail[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .limit(1);
      if (error) {
        console.error("Supabase connection error:", error);
      } else {
        console.log("Supabase connection successful. Data:", data);
      }
    };

    testSupabaseConnection();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase.from("resources").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setResources(data);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, coverage");

      if (error) {
        console.error("Error fetching organization details:", error);
      } else {
        // console.log(data);

        setOrgId(
          data.map((org) => ({
            id: org.id,
            name: org.name,
          }))
        );
      }
    };

    fetchOrgDetails();
  }, []);

  useEffect(() => {
    const fetchReqResources = async () => {
      const { data, error } = await supabase
        .from("requestresources")
        .select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setRequestResources(data);
      }
    };

    fetchReqResources();
  }, []);

  const handleAddResource = async (newResource: Resource) => {
    const { data, error } = await supabase
      .from("resources")
      .insert([newResource])
      .select();
    if (error) {
      console.error("Error creating alert:", error);
    } else {
      // setResources((prev) => [...prev, data[0]]);
      setIsDialogOpen(false);
    }
  };
  const handleRequestResources = async (newResource: requestResources) => {
    const { data, error } = await supabase
      .from("requestresources")
      .insert([newResource])
      .select();
    if (error) {
      console.error("Error creating alert:", error);
    } else {
      // setRequestResources((prev) => [...prev, data[0]]);
      setIsReqDialogOpen(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) {
      console.error("Error deleting resource:", error);
    } else {
      setResources((prev) => prev.filter((res) => res.id !== id));
    }
  };

  const handleDeleteRequestResource = async (id: string) => {
    const { error } = await supabase
      .from("requestresources")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting requested resource:", error);
    } else {
      setRequestResources((prev) => prev.filter((res) => res.id !== id));
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("resources")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "resources" },
        (payload) => {
          setResources((prev) => [...prev, payload.new as Resource]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("requestresources")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requestresources" },
        (payload) => {
          setRequestResources((prev) => [
            ...prev,
            payload.new as requestResources,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("requestresources")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "requestresources" },
        (payload) => {
          setRequestResources((prev) =>
            prev.filter((res) => res.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  console.log(orgId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resource Management</h1>
        <div className="flex gap-2">
          {/* <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter //Not needed 
          </Button> */}
          <Dialog open={isReqDialogOpen} onOpenChange={setIsReqDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Cross className="mr-2 h-4 w-4" /> Request Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Resource</DialogTitle>
              </DialogHeader>

              <RequestResourceForm onSubmit={handleRequestResources} />
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <ResourceForm onSubmit={handleAddResource} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                {resource.name}
              </CardTitle>
              <div className="flex items-center gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{resource.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">
                    {resource.quantity} {resource.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {resource.location.lat}, {resource.location.lng}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{resource.status}</p>
                </div>
                {resource.conditions && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Conditions</p>
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
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
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
        {requestResource
          .filter((resource) => resource.organizationId === orgId[0].id)
          .map((resource) => (
            <Card key={resource.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {resource.name}
                </CardTitle>
                <div className="flex items-center gap-2">
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRequestResource(resource.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{resource.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {resource.quantity} {resource.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {resource.location.lat}, {resource.location.lng}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{resource.status}</p>
                  </div>
                  {resource.conditions && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Conditions
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
                        Expiry Date
                      </p>
                      <p className="font-medium">{resource.expiryDate}</p>
                    </div>
                  )}
                </div>
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
interface RequestResourceFormProps {
  onSubmit: (resource: requestResources) => void;
}

function ResourceForm({ onSubmit }: ResourceFormProps) {
  const [formData, setFormData] = useState<
    Omit<Resource, "id" | "lastUpdated">
  >({
    type: "food",
    name: "",
    quantity: 0,
    unit: "",
    location: { lat: 0, lng: 0 },
    status: "available",
    organizationId: "",
    expiryDate: "",
    conditions: [],
    // priority: "low",
    // disasterType: "flood",
  });

  const [organizarionId, setOrganizationId] = useState<string>("");
  const [locData, setLocData] = useState<string>("");

  useEffect(() => {
    const fetchOrgID = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id ");

      if (error) {
        console.error("Error fetching organization ID:", error);
      } else if (data && data.length > 0) {
        setOrganizationId(data[0].id);
      } else {
        console.warn("No organization ID found.");
      }
    };
    fetchOrgID();
  }, []);
  useEffect(() => {
    const fetchOrgID = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("coverage ");

      if (error) {
        console.error("Error fetching organization ID:", error);
      } else if (data && data.length > 0) {
        const centre = data[0].coverage?.center;
        if (centre) {
          // setLocData(centre);
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: centre.lat,
              lng: centre.lng,
            },
          }));
        }
      } else {
        console.warn("No organization ID found.");
      }
    };
    fetchOrgID();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResource: Resource = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
      lastUpdated: new Date().toISOString(),
      organizationId: organizarionId,
    };
    onSubmit(newResource);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as Resource["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="shelter">Shelter</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Quantity</Label>
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
        <Label>Unit</Label>
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as Resource["status"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="allocated">Allocated</SelectItem>
            <SelectItem value="depleted">Depleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Expiry Date</Label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Conditions</Label>
        <Input
          value={formData.conditions?.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: e.target.value.split(", "),
            })
          }
          placeholder="Enter conditions separated by commas"
        />
      </div>

      <Button type="submit">Add Resource</Button>
    </form>
  );
}
function RequestResourceForm({ onSubmit }: RequestResourceFormProps) {
  const [formData, setFormData] = useState<
    Omit<requestResources, "id" | "lastUpdated">
  >({
    type: "food",
    name: "",
    quantity: 0,
    unit: "",
    location: { lat: 0, lng: 0 },
    status: "requested",
    organizationId: "",
    expiryDate: "",
    conditions: [],
    // priority: "medium",
    disasterType: "flood",
    urgency: "normal",
    requestedBy: "",
  });

  const [organizarionId, setOrganizationId] = useState<string>("");
  const [locData, setLocData] = useState<string>("");

  useEffect(() => {
    const fetchOrgID = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id ");

      if (error) {
        console.error("Error fetching organization ID:", error);
      } else if (data && data.length > 0) {
        setOrganizationId(data[0].id);
      } else {
        console.warn("No organization ID found.");
      }
    };
    fetchOrgID();
  }, []);
  useEffect(() => {
    const fetchOrgID = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("coverage ");

      if (error) {
        console.error("Error fetching organization ID:", error);
      } else if (data && data.length > 0) {
        const centre = data[0].coverage?.center;
        if (centre) {
          // setLocData(centre);
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: centre.lat,
              lng: centre.lng,
            },
          }));
        }
      } else {
        console.warn("No organization ID found.");
      }
    };
    fetchOrgID();
  }, []);

  // console.log(locData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResource: requestResources = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
      // location: {
      //   lat: locData.lat,
      //   lng: formData.location.lng,
      // },
      lastUpdated: new Date().toISOString(),
      requestedBy: organizarionId,
    };
    onSubmit(newResource);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as Resource["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="shelter">Shelter</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Quantity</Label>
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
        <Label>Unit</Label>
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              status: value as requestResources["status"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="allocated">Allocated</SelectItem>
            <SelectItem value="depleted">Depleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Expiry Date</Label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Conditions</Label>
        <Input
          value={formData.conditions?.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: e.target.value.split(", "),
            })
          }
          placeholder="Enter conditions separated by commas"
        />
      </div>

      <div>
        <Label>Urgency</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              urgency: value as requestResources["urgency"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Disaster Type</Label>
        <Select
          value={formData.disasterType}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              disasterType: value as requestResources["disasterType"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select disaster type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="earthquake">Earthquake</SelectItem>
            <SelectItem value="flood">Flood</SelectItem>
            <SelectItem value="fire">Fire</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* <div>
        <Label>Location</Label>
        <Input
          type="text"
          value={`${formData.location.lat}, ${formData.location.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value
              .split(",")
              .map((s) => parseFloat(s.trim()));
            setFormData({ ...formData, location: { lat, lng } });
          }}
          placeholder="Enter latitude, longitude"
          required
        />
      </div> */}

      <Button type="submit">Request Resource</Button>
    </form>
  );
}
