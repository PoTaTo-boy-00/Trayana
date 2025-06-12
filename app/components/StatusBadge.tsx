import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Status } from "../types";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translation-context";
// import { toast } from "sonner";

interface StatusBadgeProps {
  status: Status;
  onStatusChange: (newStatus: Status) => Promise<void>;
}

export const StatusBadge = ({ status, onStatusChange }: StatusBadgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(status);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  const statusColors: Record<Status, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",

    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    unapproved: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const handleStatusChange = async (newStatus: Status) => {
    setIsUpdating(true);
    try {
      setSelectedStatus(newStatus);
      await onStatusChange(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      setSelectedStatus(status); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };
  const { t, language } = useTranslation();

  if (isEditing) {
    return (
      <Select
        value={selectedStatus}
        onValueChange={(value) => handleStatusChange(value as Status)}
        disabled={isUpdating}
      >
        <SelectTrigger className={`w-[180px] ${statusColors[selectedStatus]}`}>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(statusColors) as Status[]).map((statusKey) => (
            <SelectItem
              key={statusKey}
              value={statusKey}
              className={statusColors[statusKey]}
            >
              {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div
      className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
        statusColors[status]
      } ${isUpdating ? "opacity-50" : ""}`}
      onClick={() => setIsEditing(true)}
    >
      {isUpdating
        ? "Updating..."
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};
