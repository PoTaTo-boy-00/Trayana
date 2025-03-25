"use client";

import { useState } from "react";
import { Building2, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/app/types";

export default function OrganizationPage() {
  const [organization] = useState<Organization>({
    id: "1",
    name: "Jalpaiguri Superspeciality Hospital",
    type: "healthcare",
    capabilities: ["Emergency Care", "Trauma Center", "Ambulance Service"],
    coverage: {
      center: { lat: 88.7128, lng: 27.006 },
      radius: 10,
    },
    status: "active",
    contact: {
      email: "super.maisdh@gmail.com",
      phone: "+91 3561232002",
      emergency: "03561 232 002",
    },
    address: "Hospital Road, Jalpaiguri, West Bengal, 735101, India",
    operatingHours: {
      start: "00:00",
      end: "24:00",
      timezone: "Indian Standar Time",
    },
    resources: [],
    personnel: [],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Profile</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {organization.name}
            </CardTitle>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                organization.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}
            >
              {organization.status.charAt(0).toUpperCase() +
                organization.status.slice(1)}
            </span>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{organization.type}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Capabilities</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {organization.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-2 py-1 bg-secondary rounded-full text-xs"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{organization.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                <span>{organization.contact.emergency}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{organization.contact.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <span>{organization.address}</span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Operating Hours</p>
              <p className="font-medium">
                {organization.operatingHours.start} -{" "}
                {organization.operatingHours.end} (
                {organization.operatingHours.timezone})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
