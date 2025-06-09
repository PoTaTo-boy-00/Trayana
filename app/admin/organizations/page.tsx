"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Building2, Phone, Mail, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization, Status } from "@/app/types";
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
import { useTranslation } from "@/lib/translation-context";
import { StatusBadge } from "@/app/components/StatusBadge";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleUpadteOrganizationStatus = async (
    id: string,
    newStatus: Status
  ) => {
    try {
      const updateData = {
        status: newStatus,
      };
      const { data, error } = await supabase
        .from("organizations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
    } catch (error) {}
  };

  const handleDeleteOrganization = async (id: string) => {
    setLoading(true);

    try {
      const { data: orgData, error: fetchError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      //  Soft-delete the resource
      const { error: deleteError } = await supabase
        .from("organizations")
        .update({ is_deleted: true })
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting resource:", deleteError);
        return;
      }

      if (fetchError || !orgData) {
        console.error("Failed to fetch resource before delete:", fetchError);
        return;
      }

      setOrganizations((prev) => prev.filter((org) => org.id !== id));
    } catch (err) {
      console.error("Unexpected error during deletion:", err);
    }

    setLoading(false);
  };
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("organizations.title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("organizations.button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("organizations.dialogTitle")}</DialogTitle>
            </DialogHeader>
            <OrganizationForm onSubmit={handleAddOrganization} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {organizations
          .filter((org) => !org.is_deleted)
          .map((org) => (
            <Card key={org.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {org.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={org.status}
                    onStatusChange={async (newStatus: Status) => {
                      await handleUpadteOrganizationStatus(org.id, newStatus);
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteOrganization(org.id)}
                  >
                    Delete
                  </Button>
                </div>
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
    is_deleted: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: Organization = {
      ...formData,
      id: uuidv4(), // Generate a unique ID
    };
    onSubmit(newOrg);
  };

  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{t("organizationForm.orgName")}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>{t("organizationForm.orgTypes.title")}</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as Organization["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("organizationForm.orgTypes.placeholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthcare">
              {t("organizationForm.orgTypes.options.healthcare")}
            </SelectItem>
            <SelectItem value="ngo">
              {t("organizationForm.orgTypes.options.ngo")}
            </SelectItem>
            <SelectItem value="essential">
              {t("organizationForm.orgTypes.options.essentials")}
            </SelectItem>
            <SelectItem value="infrastructure">
              {t("organizationForm.orgTypes.options.infrastructure")}
            </SelectItem>
            <SelectItem value="community">
              {t("organizationForm.orgTypes.options.community")}
            </SelectItem>
            <SelectItem value="private">
              {t("organizationForm.orgTypes.options.private")}
            </SelectItem>
            <SelectItem value="specialized">
              {t("organizationForm.orgTypes.options.specialized")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("organizationForm.orgCapabilities.title")}</Label>
        <Input
          value={formData.capabilities.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              capabilities: e.target.value.split(", "),
            })
          }
          placeholder={t("organizationForm.orgCapabilities.placeholder")}
        />
      </div>

      <div>
        <Label>{t("organizationForm.contactEmail.title")}</Label>
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
        <Label>{t("organizationForm.contactPhone.title")}</Label>
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
        <Label>{t("organizationForm.address.title")}</Label>
        <Input
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label>{t("organizationForm.latitude")}</Label>
        <Input
          type="number"
          value={formData.coverage.center.lat}
          onChange={(e) => {
            setFormData({
              ...formData,
              coverage: {
                ...formData.coverage,
                center: {
                  ...formData.coverage.center,
                  lat: parseFloat(e.target.value),
                },
              },
            });
          }}
          required
        />
      </div>
      <div>
        <Label>{t("organizationForm.longitude")}</Label>
        <Input
          value={formData.coverage.center.lng}
          onChange={(e) => {
            setFormData({
              ...formData,
              coverage: {
                ...formData.coverage,
                center: {
                  ...formData.coverage.center,
                  lng: parseFloat(e.target.value),
                },
              },
            });
          }}
          required
        />
      </div>

      <Button type="submit">{t("organizationForm.submitButton")}</Button>
    </form>
  );
}
