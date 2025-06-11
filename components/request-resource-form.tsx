// components/request-resource-form.tsx
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { requestResources } from "@/app/types";
import { useTranslation } from "@/lib/translation-context";

interface RequestResourceFormProps {
  onSubmit: (
    resource: Omit<requestResources, "id" | "lastUpdated" | "requestedBy">
  ) => void;
}

export const RequestResourceForm = ({ onSubmit }: RequestResourceFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<
    Omit<requestResources, "id" | "lastUpdated" | "requestedBy">
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
    disasterType: "flood",
    urgency: "normal",
  });

  const [organizationId, setOrganizationId] = useState("");

  useEffect(() => {
    const fetchOrgData = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, coverage");

      if (error) {
        console.error("Error fetching organization data:", error);
        return;
      }

      if (data && data.length > 0) {
        setOrganizationId(data[0].id);
        const center = data[0].coverage?.center;
        if (center) {
          setFormData((prev) => ({
            ...prev,
            location: { lat: center.lat, lng: center.lng },
            organizationId: data[0].id,
          }));
        }
      }
    };

    fetchOrgData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      organizationId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.name")}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.resourceType.title")}</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              type: value as requestResources["type"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">{t("partnerPage.components.resources.requestResourceForm.resourceType.options.food")}</SelectItem>
            <SelectItem value="medicine">{t("partnerPage.components.resources.requestResourceForm.resourceType.options.medicine")}</SelectItem>
            <SelectItem value="shelter">{t("partnerPage.components.resources.requestResourceForm.resourceType.options.shelter")}</SelectItem>
            <SelectItem value="equipment">{t("partnerPage.components.resources.requestResourceForm.resourceType.options.equipment")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.quantity")}</Label>
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
        <Label>{t("partnerPage.components.resources.requestResourceForm.unit")}</Label>
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.status.title")}</Label>
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
            <SelectItem value="requested">{t("partnerPage.components.resources.requestResourceForm.status.options.requested")}</SelectItem>
            <SelectItem value="allocated">{t("partnerPage.components.resources.requestResourceForm.status.options.allocated")}</SelectItem>
            <SelectItem value="depleted">{t("partnerPage.components.resources.requestResourceForm.status.options.depleted")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.expiryDate")}</Label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.conditions.title")}</Label>
        <Input
          value={formData.conditions?.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: e.target.value.split(", "),
            })
          }
          placeholder={t("partnerPage.components.resources.requestResourceForm.conditions.placeholder")}
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.urgency.title")}</Label>
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
            <SelectItem value="low">{t("partnerPage.components.resources.requestResourceForm.urgency.options.low")}</SelectItem>
            <SelectItem value="normal">{t("partnerPage.components.resources.requestResourceForm.urgency.options.medium")}</SelectItem>
            <SelectItem value="high">{t("partnerPage.components.resources.requestResourceForm.urgency.options.high")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.requestResourceForm.disasterType.title")}</Label>
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
            <SelectItem value="earthquake">{t("partnerPage.components.resources.requestResourceForm.disasterType.options.earthquake")}</SelectItem>
            <SelectItem value="flood">{t("partnerPage.components.resources.requestResourceForm.disasterType.options.flood")}</SelectItem>
            <SelectItem value="fire">{t("partnerPage.components.resources.requestResourceForm.disasterType.options.fire")}</SelectItem>
            <SelectItem value="other">{t("partnerPage.components.resources.requestResourceForm.disasterType.options.other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">{t("partnerPage.components.resources.requestResourceForm.submitButton")}</Button>
    </form>
  );
};
