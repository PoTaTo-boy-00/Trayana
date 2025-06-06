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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resource Management</h1>
        <div className="flex gap-2">
          <Dialog open={isReqDialogOpen} onOpenChange={setIsReqDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Cross className="mr-2 h-4 w-4" /> Request Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Resource</DialogTitle>
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
                <Plus className="mr-2 h-4 w-4" /> Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
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
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      <div className="text-xl font-semibold">Requested Resources</div>
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
