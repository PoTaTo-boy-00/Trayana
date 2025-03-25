import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <Shield className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-[emoji] text-red-600 tracking-[0.1em] font-bold sm:text-6xl">
            त्रyana
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A comprehensive platform connecting government agencies and partner
            organizations for effective disaster response coordination.
          </p>

          <div className="flex gap-4">
            <Link href="/admin">
              <Button size="lg">Admin Dashboard</Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline">
                Partner Portal
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Color-coded severity levels for immediate response with
                location-based notifications and resource allocation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track and allocate critical resources including food, medicine,
                shelter, and equipment across affected areas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with healthcare providers, NGOs, essential services, and
                specialized response teams.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
