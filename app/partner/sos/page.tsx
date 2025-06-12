"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Clock, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getCloneableBody } from "next/dist/server/body-streams";

type SOSReport = {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  status?: "pending" | "dispatched" | "resolved";
  personnel?: string | null;
};

type Personnel = {
  id: string;
  name: string;
  status: "available" | "deployed";
};
export default function SOSPage() {
  const [reports, setReports] = useState<SOSReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [selectedReport, setSelectedReport] = useState<SOSReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const handlePersonnelDispatch = async (
    personnel: Personnel,
    report: SOSReport
  ) => {
    const locationStr = `${report.latitude}, ${report.longitude}`;

    try {
      //  Update personnel status + location
      const { error: personnelError } = await supabase
        .from("personnel")
        .update({
          status: "deployed",
          location: locationStr,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", personnel.id);

      if (personnelError) throw personnelError;

      //Insert SOS to sos_history
      const { error: insertError } = await supabase.from("sos_history").insert([
        {
          ...report,
          status: "dispatched",
          personnel: personnel.id,
          dispatched_at: new Date().toISOString(), // optional extra field
        },
      ]);

      if (insertError) throw insertError;

      //  Delete from sos_report
      const { error: deleteError } = await supabase
        .from("sosReport")
        .delete()
        .eq("id", report.id);

      if (deleteError) throw deleteError;

      // ✅ Step 4: Update UI
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      toast.success(`Dispatched ${personnel.name} successfully`);
      setShowModal(false);
    } catch (err) {
      console.error("Dispatch failed:", err);
      toast.error("Dispatch failed");
    }
  };

  const fetchAvailablePersonnel = async () => {
    const { data, error } = await supabase
      .from("personnel")
      .select("*")
      .eq("status", "available");
    // .eq("organization_id", organizationId);

    console.log(data);

    if (error) {
      toast.error("Failed to fetch personnel");
      return;
    }

    setPersonnelList(data || []);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("sosReport")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error("No data returned from query");
        }

        const reportsWithStatus = data.map((report) => ({
          ...report,
          status: report.status || "pending",
        }));

        setReports(reportsWithStatus);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load reports"
        );
        toast.error("Failed to load SOS reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    // Realtime subscription
    const channel = supabase
      .channel("sos_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sosReport",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setReports((prev) => [
              {
                ...(payload.new as SOSReport),
                status: "pending",
              },
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            setReports((prev) =>
              prev.map((report) =>
                report.id === payload.new.id
                  ? { ...report, ...payload.new }
                  : report
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDispatch = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("sosReport")
        .update({ status: "dispatched" })
        .eq("id", reportId);

      if (error) throw error;

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "dispatched" } : report
        )
      );
      toast.success("Help dispatched successfully");
    } catch (error) {
      console.error("Dispatch error:", error);
      toast.error("Failed to dispatch help");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "dispatched":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Dispatched
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">SOS Reports</h1>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>Error: {error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">SOS Reports</h1>

      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">
              Select Personnel to Dispatch
            </h2>
            {personnelList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No available personnel
              </p>
            ) : (
              <ul className="space-y-2">
                {personnelList.map((person) => (
                  <li key={person.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() =>
                        handlePersonnelDispatch(person, selectedReport)
                      }
                    >
                      {person.name}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center space-y-2">
            <p>No active SOS reports found</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="text-red-500" />
                  SOS Report
                </CardTitle>
                {getStatusBadge(report.status || "pending")}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {report.latitude.toFixed(4)},{" "}
                      {report.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Reported at: {new Date(report.created_at).toLocaleString()}
                  </span>
                  <span className="font-mono text-xs">ID: {report.id}</span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                {report.status === "pending" && (
                  <Button
                    onClick={() => {
                      setSelectedReport(report);
                      fetchAvailablePersonnel();
                      setShowModal(true);
                    }}
                  >
                    Dispatch Help
                  </Button>
                )}

                {report.status === "dispatched" && (
                  <Button variant="outline" disabled>
                    Help Dispatched
                  </Button>
                )}
                {report.status === "resolved" && (
                  <Button variant="outline" disabled>
                    Resolved
                  </Button>
                )}
                {report.personnel && (
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {report.personnel}
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
