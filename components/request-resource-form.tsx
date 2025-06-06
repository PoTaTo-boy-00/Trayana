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

interface RequestResourceFormProps {
  onSubmit: (
    resource: Omit<requestResources, "id" | "lastUpdated" | "requestedBy">
  ) => void;
}

export const RequestResourceForm = ({ onSubmit }: RequestResourceFormProps) => {
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

      <Button type="submit">Request Resource</Button>
    </form>
  );
};
