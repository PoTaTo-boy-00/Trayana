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
import { useState } from "react";
import { useTranslation } from "@/lib/translation-context";
export default function ResourcesPage() {
  const {
    resources,
    requestedResources,
    orgDetails,
    isLoading,
    addResource,
    requestResource,
    deleteRequestedResource,
  } = useResources();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReqDialogOpen, setIsReqDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("partnerPage.components.resources.title")}</h1>
        <h1 className="text-3xl font-bold">{t("partnerPage.components.resources.title")}</h1>
        <div className="flex gap-2">
          <Dialog open={isReqDialogOpen} onOpenChange={setIsReqDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Cross className="mr-2 h-4 w-4" /> {t("partnerPage.components.resources.requestButton")}
                <Cross className="mr-2 h-4 w-4" /> {t("partnerPage.components.resources.requestButton")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("partnerPage.components.resources.requestResourceForm.title")}</DialogTitle>
                <DialogTitle>{t("partnerPage.components.resources.requestResourceForm.title")}</DialogTitle>
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
                <Plus className="mr-2 h-4 w-4" /> {t("partnerPage.components.resources.addButton")}
                <Plus className="mr-2 h-4 w-4" /> {t("partnerPage.components.resources.addButton")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("partnerPage.components.resources.addResourceForm.title")}</DialogTitle>
                <DialogTitle>{t("partnerPage.components.resources.addResourceForm.title")}</DialogTitle>
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
            <ResourceCard key={resource.id} resource={resource} />
          ))}
      </div>

      <div className="text-xl font-semibold">{t("partnerPage.components.resources.requestedResources")}</div>

      <div className="text-xl font-semibold">{t("partnerPage.components.resources.requestedResources")}</div>
      <div className="grid gap-4">
        {!isLoading &&
          orgDetails.length > 0 &&
          requestedResources
            .filter((resource) => resource.organizationId === orgDetails[0].id)
            .map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isRequest
                onDelete={deleteRequestedResource}
              />
            ))}
      </div>
    </div>
  );
}
