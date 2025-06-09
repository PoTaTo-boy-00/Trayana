// components/resource-card.tsx
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Resource, requestResources } from "@/app/types";
import { Button } from "@/components/ui/button";

interface ResourceCardProps {
  resource: Resource | requestResources;
  onDelete?: (id: string) => void;
  isRequest?: boolean;
}

export const ResourceCard = ({
  resource,
  onDelete,
  isRequest = false,
}: ResourceCardProps) => {
  const statusColors = {
    available:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    allocated:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    depleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    requested: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  };

  const status = resource.status;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          {resource.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-sm ${statusColors[status]}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {isRequest && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(resource.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{resource.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="font-medium">
              {resource.quantity} {resource.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">
              {resource.location.lat}, {resource.location.lng}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{resource.status}</p>
          </div>
          {resource.conditions && resource.conditions.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Conditions</p>
              <div className="flex gap-2 mt-1">
                {resource.conditions.map((condition) => (
                  <span
                    key={condition}
                    className="px-2 py-1 bg-secondary rounded-full text-xs"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
          {"expiryDate" in resource && resource.expiryDate && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Expiry Date</p>
              <p className="font-medium">{resource.expiryDate}</p>
            </div>
          )}
          {"disasterType" in resource && (
            <div>
              <p className="text-sm text-muted-foreground">Disaster Type</p>
              <p className="font-medium">{resource.disasterType}</p>
            </div>
          )}
          {"urgency" in resource && (
            <div>
              <p className="text-sm text-muted-foreground">Urgency</p>
              <p className="font-medium">{resource.urgency}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
