// components/resource-card.tsx
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Resource, requestResources } from "@/app/types";
import { Button } from "@/components/ui/button";
import { useOrgStore } from "@/store/orgStore";

interface ResourceCardProps {
  resource: Resource | requestResources;
  onDelete?: (id: string) => void;
  onUpdateResource?: (res: Resource) => void;
  isRequest?: boolean;
}

export const ResourceCard = ({
  resource,
  onDelete,
  onUpdateResource,
  isRequest = false,
}: ResourceCardProps) => {
  const { organizationId } = useOrgStore();
  const isOwnedResource =
    !isRequest && (resource as Resource).organizationId === organizationId;

  const statusColors = {
    available:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    allocated:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    depleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    requested: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  };

  const status = resource.status;

  const renderActionButtons = () => {
    if (isRequest) {
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete?.(resource.id)}
        >
          Delete
        </Button>
      );
    }

    if (isOwnedResource && onUpdateResource) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateResource(resource as Resource)}
        >
          Update
        </Button>
      );
    }

    return null;
  };

  const renderResourceDetail = (label: string, value: React.ReactNode) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        isOwnedResource ? "border-l-4 border-primary" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          <div>
            {resource.name}
            {isOwnedResource && (
              <span className="ml-2 text-xs text-muted-foreground">
                (Your Resource)
              </span>
            )}
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-sm ${statusColors[status]}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {renderActionButtons()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {renderResourceDetail("Type", resource.type)}
          {renderResourceDetail(
            "Quantity",
            `${resource.quantity} ${resource.unit}`
          )}
          {renderResourceDetail(
            "Location",
            `${resource.location.lat}, ${resource.location.lng}`
          )}
          {renderResourceDetail("Status", status)}

          {resource.conditions && resource.conditions.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Conditions</p>
              <div className="flex gap-2 mt-1 flex-wrap">
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
              {renderResourceDetail("Expiry Date", resource.expiryDate)}
            </div>
          )}

          {"urgency" in resource &&
            renderResourceDetail("Urgency", resource.urgency)}
        </div>
      </CardContent>
    </Card>
  );
};
