"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Users, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Personnel } from "@/app/types";
import { useTranslation } from "@/lib/translation-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/statusBadge";
import { DeployForm } from "@/components/ui/deployForm";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PersonnelPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Fetch user and organization
  useEffect(() => {
    const fetchUserAndPersonnel = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log(user);

        if (userError || !user) throw new Error("User not logged in");

        // Fetch organization_id of the user
        const { data: userDetails, error: userDetailsError } = await supabase
          .from("users")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        console.log(userDetails);

        if (userDetailsError || !userDetails)
          throw new Error("Failed to fetch user details");

        const { organization_id } = userDetails;
        // console.log(organization_id);
        console.log(organization_id);
        setOrganizationId(userDetails.organization_id);

        console.log(organizationId);

        // Now fetch only personnel for this org
        const { data: personnelData, error: personnelError } = await supabase
          .from("personnel")
          .select("*")
          .eq("organization_id", organization_id);

        if (personnelError) throw personnelError;

        setPersonnel(personnelData || []);
      } catch (err) {
        console.error("Error fetching user and personnel:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPersonnel();
  }, [organizationId]);

  const updatePersonnelStatus = async (
    id: string,
    newStatus: Personnel["status"],
    location?: string | null
  ) => {
    try {
      const updateData = {
        status: newStatus,
        location: newStatus === "available" ? null : location || null,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("personnel")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned");

      setPersonnel((prev) =>
        prev.map((person) =>
          person.id === id ? { ...person, ...data } : person
        )
      );

      return { success: true };
    } catch (err) {
      console.error("Update failed:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const handleAddPersonnel = async (
    newPersonnel: Omit<Personnel, "id" | "timestamp" | "organization_id">
  ) => {
    console.log("entered");
    console.log(organizationId);
    if (!organizationId) return;

    try {
      const completePersonnel: Personnel = {
        ...newPersonnel,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        organization_id: organizationId,
      };

      const { data, error } = await supabase
        .from("personnel")
        .insert(completePersonnel)
        .select();
      // .single();

      if (error) throw error;

      setPersonnel((prev) => [...prev, data[0]]);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error adding personnel:", err);
    }
  };

  if (loading) return <div>{t("partnerPage.components.personnel.loading")}</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("partnerPage.components.personnel.title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("partnerPage.components.personnel.addButton")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Personnel</DialogTitle>
            </DialogHeader>
            <PersonnelForm onSubmit={handleAddPersonnel} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personnel.map((person) => (
          <PersonnelCard
            key={person.id}
            person={person}
            onStatusUpdate={(id, status, location) => {
              void updatePersonnelStatus(id, status, location);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Extracted Personnel Card Component
function PersonnelCard({
  person,
  onStatusUpdate,
}: {
  person: Personnel;
  onStatusUpdate: (
    id: string,
    status: Personnel["status"],
    location?: string | null
  ) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          {person.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <StatusBadge status={person.status} />
          {person.status === "available" ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">Deploy</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy {person.name}</DialogTitle>
                </DialogHeader>
                <DeployForm
                  onSubmit={(location) => {
                    onStatusUpdate(person.id, "deployed", location);
                  }}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate(person.id, "available")}
            >
              Mark Available
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-medium">{person.role}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Skills</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {person.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-secondary rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{person.contact.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{person.contact.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Improved Form Component
function PersonnelForm({
  onSubmit,
}: {
  onSubmit: (
    personnel: Omit<Personnel, "id" | "timestamp" | "organization_id">
  ) => void;
}) {
  const [formData, setFormData] = useState<
    Omit<Personnel, "id" | "organization_id">
  >({
    name: "",
    role: "",
    status: "available",
    skills: [],
    contact: { phone: "", email: "" },
    location: undefined,
    timestamp: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name*</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.contact.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: { ...formData.contact, phone: e.target.value },
            })
          }
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.contact.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: { ...formData.contact, email: e.target.value },
            })
          }
        />
      </div>
      <Button type="submit" className="w-full">
        Add Personnel
      </Button>
    </form>
  );
}
