import { useState } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "@/app/components/ui/button";
import { CloudFog, Send } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

export function DeployForm({
  onSubmit,
  onCancel, // Optional cancel handler
}: {
  onSubmit: (location: string) => void;
  onCancel?: () => void; // Optional prop for handling cancel
}) {
  const [location, setLocation] = useState("");

  console.log(location);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(location);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="deployment-location">Deployment Location</Label>
        <Input
          id="deployment-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          placeholder="Enter deployment location"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
        )}
        <DialogClose asChild>
          <Button type="submit">
            <Send className="mr-2 h-4 w-4" /> Confirm Deployment
          </Button>
        </DialogClose>
      </div>
    </form>
  );
}
