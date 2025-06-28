// app/resources/page.tsx
"use client";

import { Plus, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useResources } from "@/hooks/use-resources";
import { ResourceCard } from "@/components/resource-card";

import { ResourceForm } from "@/components/resource-forms";
import { RequestResourceForm } from "@/components/request-resource-form";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/translation-context";
import { supabase } from "@/lib/supabase";
import { UpdateResourceDialog } from "@/components/UpdateResourceDialog";
import { fetchResources } from "@/data/resource";
import { Resource } from "@/app/types";
export default function ResourcesPage() {
  const {
    resources,
    requestedResources,
    orgDetails,
    userDetails,
    isLoading,
    addResource,
    requestResource,
    deleteRequestedResource,
  } = useResources();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReqDialogOpen, setIsReqDialogOpen] = useState(false);
  const [currOrgID, setCurrOrgID] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const handleUpdateResource = (res: Resource) => {
    setSelectedResource(res);
    setShowUpdateDialog(true);
  };
  const fetchCurrentOrgID = async () => {
    if (!userDetails?.id) return;

    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("admin_id", userDetails.id)
      .single(); // ensures only one result

    if (error) {
      console.error("Error fetching current organization ID:", error);
    } else {
      setCurrOrgID(data?.id || null);
      console.log("Current Org ID:", data?.id);
    }
  };

  useEffect(() => {
    fetchCurrentOrgID();
  }, [userDetails]);

  // console.log(orgDetails.adminId);
  // // console.log("Filtering with org:", userDetails?.id);
  // const userOrgId =
  //   orgDetails.find((org) => org.admin_id === userDetails?.id)?.id || "";
  // console.log(resources);
  // console.log(
  //   "Requested Resources:",
  //   requestedResources.map((r) => ({
  //     requestedBy: r.requestedBy,
  //     id: r.id,
  //   }))
  // );
  const { t } = useTranslation();
  console.log(orgDetails[0]?.id);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {t("partnerPage.components.resources.title")}
        </h1>
        <div className="flex gap-2">
          <Dialog open={isReqDialogOpen} onOpenChange={setIsReqDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Cross className="mr-2 h-4 w-4" />{" "}
                {t("partnerPage.components.resources.requestButton")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t(
                    "partnerPage.components.resources.requestResourceForm.title"
                  )}
                </DialogTitle>
              </DialogHeader>
              <RequestResourceForm
                onSubmit={async (resource) => {
                  const success = await requestResource(resource);
                  if (success) setIsReqDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />{" "}
                {t("partnerPage.components.resources.addButton")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("partnerPage.components.resources.addResourceForm.title")}
                </DialogTitle>
              </DialogHeader>
              <ResourceForm
                onSubmit={async (resource) => {
                  const success = await addResource(resource);
                  if (success) setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {resources
          .filter((res) => !res.is_deleted)
          .map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onUpdateResource={handleUpdateResource}
            />
          ))}
      </div>

      <div className="text-xl font-semibold">
        {t("partnerPage.components.resources.requestedResources")}
      </div>
      <div className="grid gap-4">
        {!isLoading &&
          orgDetails.length > 0 &&
          requestedResources
            .filter((resource) => resource.organizationId === currOrgID)
            .map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isRequest
                onDelete={deleteRequestedResource}
              />
            ))}
      </div>
      <UpdateResourceDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        resource={selectedResource}
        onSuccess={async () => {
          await fetchResources(); // if needed
          setSelectedResource(null);
        }}
      />
    </div>
  );
}
