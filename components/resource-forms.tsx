// components/resource-form.tsx
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
import { Resource } from "@/app/types";
import { useTranslation } from "@/lib/translation-context";

interface ResourceFormProps {
  onSubmit: (resource: Omit<Resource, "id" | "lastUpdated">) => void;
}

export const ResourceForm = ({ onSubmit }: ResourceFormProps) => {
  const { t } = useTranslation();
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
        <Label>{t("partnerPage.components.resources.addResourceForm.name")}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.addResourceForm.type.title")}</Label>
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
            <SelectItem value="food">{t("partnerPage.components.resources.addResourceForm.type.options.food")}</SelectItem>
            <SelectItem value="medicine">{t("partnerPage.components.resources.addResourceForm.type.options.medicine")}</SelectItem>
            <SelectItem value="shelter">{t("partnerPage.components.resources.addResourceForm.type.options.shelter")}</SelectItem>
            <SelectItem value="equipment">{t("partnerPage.components.resources.addResourceForm.type.options.equipment")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.addResourceForm.quantity")}</Label>
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
        <Label>{t("partnerPage.components.resources.addResourceForm.unit")}</Label>
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.addResourceForm.status.title")}</Label>
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
            <SelectItem value="available">{t("partnerPage.components.resources.addResourceForm.status.options.available")}</SelectItem>
            <SelectItem value="allocated">{t("partnerPage.components.resources.addResourceForm.status.options.allocated")}</SelectItem>
            <SelectItem value="depleted">{t("partnerPage.components.resources.addResourceForm.status.options.depleted")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.addResourceForm.expiryDate")}</Label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
        />
      </div>

      <div>
        <Label>{t("partnerPage.components.resources.addResourceForm.conditions.title")}</Label>
        <Input
          value={formData.conditions?.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: e.target.value.split(", "),
            })
          }
          placeholder={t("partnerPage.components.resources.addResourceForm.conditions.placeholder")}
        />
      </div>

      <Button type="submit">{t("partnerPage.components.resources.addResourceForm.submitButton")}</Button>
    </form>
  );
};
