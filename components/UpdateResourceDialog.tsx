"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Resource } from "@/app/types";

export const UpdateResourceDialog = ({
  open,
  onOpenChange,
  resource,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  resource: Resource | null;
  onSuccess: () => void;
}) => {
  if (!resource) return null;

  const [quantityChange, setQuantityChange] = useState(0);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (quantityChange <= 0) {
      setError("Please enter a positive quantity");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let newQuantity = resource.quantity;
      if (operation === "add") {
        newQuantity += quantityChange;
      } else {
        newQuantity = Math.max(0, resource.quantity - quantityChange);
      }

      // console.log(supabase.auth.getUser());

      // Update the resource
      const { error: updateError } = await supabase
        .from("resources")
        .update({
          quantity: newQuantity,
          status: newQuantity > 0 ? "available" : "depleted",
        })
        .eq("id", resource.id);

      if (updateError) throw updateError;

      // Create notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          id: crypto.randomUUID(),

          message: `${
            operation === "add" ? "Added" : "Used"
          } ${quantityChange} ${resource.unit} of ${resource.name}`,
          type: "resource_updated",
          timestamp: new Date().toISOString(),
          read: false,
        });

      if (notificationError) throw notificationError;

      onSuccess();
      onOpenChange(false);
      setQuantityChange(0);
    } catch (error) {
      console.error("Update failed:", error);
      setError("Failed to update resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Resource Quantity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Current quantity: <strong>{resource.quantity}</strong>{" "}
            {resource.unit}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant={operation === "add" ? "default" : "outline"}
              onClick={() => setOperation("add")}
            >
              Add
            </Button>
            <Button
              variant={operation === "subtract" ? "default" : "outline"}
              onClick={() => setOperation("subtract")}
            >
              Use
            </Button>
          </div>

          <Input
            type="number"
            value={quantityChange}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) setQuantityChange(value);
            }}
            placeholder={`Quantity to ${operation}`}
            min={1}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            onClick={handleUpdate}
            disabled={loading || quantityChange <= 0}
          >
            {loading
              ? "Updating..."
              : operation === "add"
              ? "Add Quantity"
              : "Use Quantity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
