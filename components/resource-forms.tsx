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
import { useOrgStore } from "@/store/orgStore";
// import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResourceFormProps {
  onSubmit: (resource: Omit<Resource, "id" | "lastUpdated">) => void;
  initialData?: Partial<Resource>;
}

export const ResourceForm = ({ onSubmit, initialData }: ResourceFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { organizationId } = useOrgStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<
    Omit<Resource, "id" | "lastUpdated">
  >({
    type: "food",
    name: "",
    quantity: 0,
    unit: "",
    location: { lat: 0, lng: 0 },
    status: "available",
    organizationId: organizationId || "",
    expiryDate: "",
    conditions: [],
    ...initialData,
  });

  useEffect(() => {
    const fetchDefaultLocation = async () => {
      if (!organizationId) return;

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("coverage")
          .eq("id", organizationId)
          .single();

        if (error) throw error;
        if (data?.coverage?.center) {
          setFormData((prev) => ({
            ...prev,
            location: data.coverage.center,
            organizationId,
          }));
        }
      } catch (error) {
        console.error("Error fetching organization location:", error);
      }
    };

    fetchDefaultLocation();
  }, [organizationId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.resourceNameRequired");
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = t("validation.quantityPositive");
    }
    if (!formData.unit.trim()) {
      newErrors.unit = t("validation.unitRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        organizationId: organizationId || formData.organizationId,
      });
      toast({
        title: t("success.resourceSaved"),
        description: t("success.resourceSavedDescription"),
      });
    } catch (error) {
      toast({
        title: t("error.saveFailed"),
        description:
          error instanceof Error ? error.message : t("error.unknown"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formFields = [
    {
      id: "name",
      label: t("partnerPage.components.resources.addResourceForm.name"),
      render: (
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className={errors.name ? "border-red-500" : ""}
        />
      ),
      error: errors.name,
    },
    {
      id: "type",
      label: t("partnerPage.components.resources.addResourceForm.type.title"),
      render: (
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">
              {t(
                "partnerPage.components.resources.addResourceForm.type.options.food"
              )}
            </SelectItem>
            <SelectItem value="medicine">
              {t(
                "partnerPage.components.resources.addResourceForm.type.options.medicine"
              )}
            </SelectItem>
            <SelectItem value="shelter">
              {t(
                "partnerPage.components.resources.addResourceForm.type.options.shelter"
              )}
            </SelectItem>
            <SelectItem value="equipment">
              {t(
                "partnerPage.components.resources.addResourceForm.type.options.equipment"
              )}
            </SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "quantity",
      label: t("partnerPage.components.resources.addResourceForm.quantity"),
      render: (
        <Input
          type="number"
          min="0"
          step="1"
          value={formData.quantity}
          onChange={(e) =>
            handleInputChange("quantity", Number(e.target.value))
          }
          className={errors.quantity ? "border-red-500" : ""}
        />
      ),
      error: errors.quantity,
    },
    {
      id: "unit",
      label: t("partnerPage.components.resources.addResourceForm.unit"),
      render: (
        <Input
          value={formData.unit}
          onChange={(e) => handleInputChange("unit", e.target.value)}
          className={errors.unit ? "border-red-500" : ""}
        />
      ),
      error: errors.unit,
    },
    {
      id: "status",
      label: t("partnerPage.components.resources.addResourceForm.status.title"),
      render: (
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">
              {t(
                "partnerPage.components.resources.addResourceForm.status.options.available"
              )}
            </SelectItem>
            <SelectItem value="allocated">
              {t(
                "partnerPage.components.resources.addResourceForm.status.options.allocated"
              )}
            </SelectItem>
            <SelectItem value="depleted">
              {t(
                "partnerPage.components.resources.addResourceForm.status.options.depleted"
              )}
            </SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "expiryDate",
      label: t("partnerPage.components.resources.addResourceForm.expiryDate"),
      render: (
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
        />
      ),
    },
    {
      id: "conditions",
      label: t(
        "partnerPage.components.resources.addResourceForm.conditions.title"
      ),
      render: (
        <Input
          value={formData.conditions?.join(", ")}
          onChange={(e) =>
            handleInputChange("conditions", e.target.value.split(", "))
          }
          placeholder={t(
            "partnerPage.components.resources.addResourceForm.conditions.placeholder"
          )}
        />
      ),
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {formFields.map((field) => (
        <div key={field.id}>
          <Label htmlFor={field.id}>{field.label}</Label>
          {field.render}
          {field.error && (
            <p className="mt-1 text-sm text-red-500">{field.error}</p>
          )}
        </div>
      ))}

      <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            t("partnerPage.components.resources.addResourceForm.submitButton")
          )}
        </Button>
      </div>
    </form>
  );
};
