"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  X,
  Loader2,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Organization } from "@/app/types";
import { useTranslation } from "@/lib/translation-context";

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedOrg, setEditedOrg] = useState<Organization | null>(null);
  const { t } = useTranslation();

  const supabase = createClientComponentClient();

  // Fetch organization data
  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log(session?.user);

      if (session?.user) {
        // Save user object in localStorage
        localStorage.setItem("supabaseUser", JSON.stringify(session?.user));
        console.log("User saved to localStorage:", session?.user);
      } else {
        console.error("No user found in session");
      }

      if (!session?.user) {
        setError("Please log in to view organization data");
        return;
      }

      // Fetch organization data for the current user
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("admin_id", session.user.id)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
        setError("Failed to load organization data");
        return;
      }

      if (orgData) {
        setOrganization(orgData);
        setEditedOrg(orgData);
      } else {
        setError("No organization found for this user");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedOrg(organization);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedOrg(organization);
    setError(null);
  };

  const handleSave = async () => {
    if (!editedOrg || !organization) return;

    try {
      setIsSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          name: editedOrg.name,
          type: editedOrg.type,
          capabilities: editedOrg.capabilities,
          coverage: editedOrg.coverage,
          contact: editedOrg.contact,
          address: editedOrg.address,
          operatingHours: editedOrg.operatingHours,
        })
        .eq("id", organization.id);

      if (updateError) {
        console.error("Error updating organization:", updateError);
        setError("Failed to update organization");
        return;
      }

      setOrganization(editedOrg);
      setIsEditing(false);
    } catch (err) {
      console.error("Unexpected error during save:", err);
      setError("An unexpected error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!editedOrg) return;

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedOrg({
        ...editedOrg,
        [parent]: {
          ...(editedOrg as any)[parent],
          [child]: value,
        },
      });
    } else {
      setEditedOrg({
        ...editedOrg,
        [field]: value,
      });
    }
  };

  const addCapability = () => {
    if (!editedOrg) return;
    setEditedOrg({
      ...editedOrg,
      capabilities: [...editedOrg.capabilities, ""],
    });
  };

  const updateCoverageCenter = (field: "lat" | "lng", value: string) => {
    if (!editedOrg) return;

    const numValue = parseFloat(value) || 0;
    setEditedOrg({
      ...editedOrg,
      coverage: {
        ...editedOrg.coverage,
        center: {
          ...editedOrg.coverage.center,
          [field]: numValue,
        },
      },
    });
  };

  const updateCapability = (index: number, value: string) => {
    if (!editedOrg) return;
    const newCapabilities = [...editedOrg.capabilities];
    newCapabilities[index] = value;
    setEditedOrg({
      ...editedOrg,
      capabilities: newCapabilities,
    });
  };

  const removeCapability = (index: number) => {
    if (!editedOrg) return;
    setEditedOrg({
      ...editedOrg,
      capabilities: editedOrg.capabilities.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t("partnerPage.components.organization.loading")}</span>
        </div>
      </div>
    );
  }

  if (error && !organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("partnerPage.components.organization.title")}</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchOrganizationData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("partnerPage.components.organization.title")}</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No organization data found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentOrg = isEditing ? editedOrg! : organization;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("partnerPage.components.organization.title")}</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t("partnerPage.components.organization.button")}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {isEditing ? (
                <Input
                  value={currentOrg.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="text-xl font-semibold"
                />
              ) : (
                currentOrg.name
              )}
            </CardTitle>
            <Badge
              variant={currentOrg.status === "active" ? "default" : "secondary"}
              className={
                currentOrg.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }
            >
              {currentOrg.status.charAt(0).toUpperCase() +
                currentOrg.status.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground">Type</Label>
              {isEditing ? (
                <select
                  value={currentOrg.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="healthcare">Healthcare</option>
                  <option value="ngo">NGO & Humanitarian</option>
                  <option value="essential">Essential Services</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="community">Community Support</option>
                  <option value="private">Private Sector</option>
                  <option value="specialized">Specialized Response</option>
                </select>
              ) : (
                <p className="font-medium capitalize">{currentOrg.type}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">
                  Capabilities
                </Label>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCapability}
                  >
                    Add Capability
                  </Button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {currentOrg.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={capability}
                        onChange={(e) =>
                          updateCapability(index, e.target.value)
                        }
                        placeholder="Enter capability"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCapability(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentOrg.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary">
                      {capability}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Coverage Section */}
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4" />
                Coverage Area
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Latitude
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="any"
                      value={currentOrg.coverage.center.lat}
                      onChange={(e) =>
                        updateCoverageCenter("lat", e.target.value)
                      }
                      placeholder="e.g., 22.5726"
                    />
                  ) : (
                    <p className="font-medium">
                      {currentOrg.coverage.center.lat}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Longitude
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="any"
                      value={currentOrg.coverage.center.lng}
                      onChange={(e) =>
                        updateCoverageCenter("lng", e.target.value)
                      }
                      placeholder="e.g., 88.3639"
                    />
                  ) : (
                    <p className="font-medium">
                      {currentOrg.coverage.center.lng}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Radius (km)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentOrg.coverage.radius}
                      onChange={(e) =>
                        updateField(
                          "coverage.radius",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 10"
                    />
                  ) : (
                    <p className="font-medium">
                      {currentOrg.coverage.radius} km
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Phone</Label>
                {isEditing ? (
                  <Input
                    value={currentOrg.contact.phone}
                    onChange={(e) =>
                      updateField("contact.phone", e.target.value)
                    }
                    placeholder="+91 XXXXXXXXXX"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{currentOrg.contact.phone}</span>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Emergency
                </Label>
                {isEditing ? (
                  <Input
                    value={currentOrg.contact.emergency}
                    onChange={(e) =>
                      updateField("contact.emergency", e.target.value)
                    }
                    placeholder="Emergency contact"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-red-500" />
                    <span>{currentOrg.contact.emergency}</span>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                {isEditing ? (
                  <Input
                    value={currentOrg.contact.email}
                    onChange={(e) =>
                      updateField("contact.email", e.target.value)
                    }
                    type="email"
                    placeholder="contact@example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{currentOrg.contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Address</Label>
              {isEditing ? (
                <Textarea
                  value={currentOrg.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{currentOrg.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Start Time
                </Label>
                {isEditing ? (
                  <Input
                    type="time"
                    value={currentOrg.operatingHours.start}
                    onChange={(e) =>
                      updateField("operatingHours.start", e.target.value)
                    }
                  />
                ) : (
                  <p className="font-medium">
                    {currentOrg.operatingHours.start}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  End Time
                </Label>
                {isEditing ? (
                  <Input
                    type="time"
                    value={currentOrg.operatingHours.end}
                    onChange={(e) =>
                      updateField("operatingHours.end", e.target.value)
                    }
                  />
                ) : (
                  <p className="font-medium">{currentOrg.operatingHours.end}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Timezone
                </Label>
                {isEditing ? (
                  <Input
                    value={currentOrg.operatingHours.timezone}
                    onChange={(e) =>
                      updateField("operatingHours.timezone", e.target.value)
                    }
                    placeholder="e.g., Asia/Kolkata"
                  />
                ) : (
                  <p className="font-medium">
                    {currentOrg.operatingHours.timezone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
