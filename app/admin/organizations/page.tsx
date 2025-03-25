"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Building2, Phone, Mail, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/app/types";
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

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase
        .from("organizations")
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
    const fetchOrganizations = async () => {
      const { data, error } = await supabase.from("organizations").select("*");
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setOrganizations(data);
      }
    };

    fetchOrganizations();
  }, []);

  const handleAddOrganization = async (newOrganization: Organization) => {
    const { data, error } = await supabase
      .from("organizations")
      .insert([newOrganization])
      .select();
    if (error) {
      console.error("Error creating alert:", error);
    } else {
      setOrganizations((prev) => [...prev, data[0]]);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Organization</DialogTitle>
            </DialogHeader>
            <OrganizationForm onSubmit={handleAddOrganization} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {org.name}
              </CardTitle>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  org.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}
              >
                {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{org.type}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Capabilities</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {org.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="px-2 py-1 bg-secondary rounded-full text-xs"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{org.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{org.contact.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <span>{org.address}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Form component for adding a new organization
interface OrganizationFormProps {
  onSubmit: (org: Organization) => void;
}

function OrganizationForm({ onSubmit }: OrganizationFormProps) {
  const [formData, setFormData] = useState<Omit<Organization, "id">>({
    name: "",
    type: "healthcare",
    capabilities: [],
    coverage: {
      center: { lat: 0, lng: 0 },
      radius: 0,
    },
    status: "active",
    contact: {
      email: "",
      phone: "",
      emergency: "",
    },
    address: "",
    operatingHours: {
      start: "00:00",
      end: "24:00",
      timezone: "UTC",
    },
    resources: [],
    personnel: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: Organization = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
    };
    onSubmit(newOrg);
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
            setFormData({ ...formData, type: value as Organization["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="ngo">NGO</SelectItem>
            <SelectItem value="essential">Essential</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="community">Community</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="specialized">Specialized</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Capabilities</Label>
        <Input
          value={formData.capabilities.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              capabilities: e.target.value.split(", "),
            })
          }
          placeholder="Enter capabilities separated by commas"
        />
      </div>

      <div>
        <Label>Contact Email</Label>
        <Input
          value={formData.contact.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: { ...formData.contact, email: e.target.value },
            })
          }
          required
        />
      </div>

      <div>
        <Label>Contact Phone</Label>
        <Input
          value={formData.contact.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: { ...formData.contact, phone: e.target.value },
            })
          }
          required
        />
      </div>

      <div>
        <Label>Address</Label>
        <Input
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />
      </div>

      <Button type="submit">Add Organization</Button>
    </form>
  );
}
