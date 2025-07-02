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
import { useTranslation } from "@/lib/translation-context";
import { getCloneableBody } from "next/dist/server/body-streams";
import { useOrgStore } from "@/store/orgStore";
import { Checkbox } from "@/components/ui/checkbox";

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

  const { t } = useTranslation();

  const { organizationId } = useOrgStore();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [selectedReport, setSelectedReport] = useState<SOSReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [isBulkDispatching, setIsBulkDispatching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Sort reports to show selected ones first
  const sortedReports = [...reports].sort((a, b) => {
    const aSelected = selectedReports.includes(a.id);
    const bSelected = selectedReports.includes(b.id);

    // Selected items come first
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    // For items with same selection status, sort by created_at (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const initiateBulkDispatch = () => {
    if (selectedReports.length > personnelList.length) {
      setShowConfirmDialog(true);
    } else {
      handleBulkDispatch();
    }
  };

  const handlePersonnelDispatch = async (
    personnel: Personnel,
    report: SOSReport
  ) => {
    const locationStr = `${report.latitude}, ${report.longitude}`;

    try {
      const { error: personnelError } = await supabase
        .from("personnel")
        .update({
          status: "deployed",
          location: locationStr,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", personnel.id);

      if (personnelError) throw personnelError;

      const { error: insertError } = await supabase.from("sos_history").insert([
        {
          ...report,
          status: "dispatched",
          personnel: personnel.id,
          dispatched_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from("sosReport")
        .delete()
        .eq("id", report.id);

      if (deleteError) throw deleteError;

      setReports((prev) => prev.filter((r) => r.id !== report.id));
      toast.success(`Dispatched ${personnel.name} successfully`);
      setShowModal(false);
    } catch (err) {
      console.error("Dispatch failed:", err);
      toast.error("Dispatch failed");
    }
  };

  const fetchAvailablePersonnel = async () => {
    if (!organizationId) {
      console.error("No organizationId found");
      return;
    }

    console.log("Fetching personnel for org:", organizationId);

    try {
      const { data, error } = await supabase
        .from("personnel")
        .select("id, name, status")
        .eq("status", "available")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (error) throw error;

      console.log("Fetched personnel data:", data);
      setPersonnelList(data || []);
    } catch (err) {
      console.error("Personnel fetch error:", err);
      toast.error("Failed to fetch available personnel");
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchAvailablePersonnel();
    }
  }, [organizationId]);

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
        <h1 className="text-3xl font-bold">
          {t("partnerPage.components.sos.title")}
        </h1>
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

  const handleBulkDispatch = async () => {
    try {
      setIsBulkDispatching(true);
      const availablePersonnel = [...personnelList];

      const sortedSelectedReports = [...reports]
        .filter((r) => selectedReports.includes(r.id))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      const results = await Promise.allSettled(
        sortedSelectedReports.map(async (report, index) => {
          if (index >= availablePersonnel.length) return null;

          const person = availablePersonnel[index];

          if (!report || !person) return;

          const locationStr = `${report.latitude}, ${report.longitude}`;

          await supabase
            .from("personnel")
            .update({
              status: "deployed",
              location: locationStr,
              updatedAt: new Date().toISOString(),
            })
            .eq("id", person.id);

          await supabase.from("sos_history").insert([
            {
              ...report,
              status: "dispatched",
              personnel: person.id,
              dispatched_at: new Date().toISOString(),
            },
          ]);

          await supabase.from("sosReport").delete().eq("id", report.id);

          return { success: true, report, personId: person.id };
        })
      );

      await fetchAvailablePersonnel();

      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value
      );
      const failed = selectedReports.length - successful.length;

      setReports((prev) => prev.filter((r) => !selectedReports.includes(r.id)));
      setSelectedReports([]);

      toast.success(
        `Dispatched ${successful.length} personnel successfully` +
          (failed > 0 ? ` (${failed} failed due to lack of personnel)` : "")
      );
    } catch (error) {
      console.error("Bulk dispatch failed:", error);
      toast.error("Bulk dispatch failed");
    } finally {
      setIsBulkDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {t("partnerPage.components.sos.title")}
      </h1>
      <Button
        variant={bulkMode ? "default" : "outline"}
        onClick={() => {
          setBulkMode(!bulkMode);
          setSelectedReports([]);
        }}
      >
        {bulkMode ? "Exit Bulk Mode" : "Bulk Dispatch Mode"}
      </Button>

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
          {sortedReports.map((report) => (
            <Card
              key={report.id}
              className={`relative ${
                selectedReports.includes(report.id)
                  ? "border-2 border-primary bg-primary/5"
                  : ""
              }`}
            >
              <CardHeader
                className={`flex flex-row items-center justify-between space-y-0 ${
                  bulkMode && report.status === "pending" ? "pl-12" : ""
                }`}
              >
                {bulkMode && report.status === "pending" && (
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedReports([...selectedReports, report.id]);
                        } else {
                          setSelectedReports(
                            selectedReports.filter((id) => id !== report.id)
                          );
                        }
                      }}
                    />
                  </div>
                )}
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="text-red-500" />
                  {t("partnerPage.components.sos.header")}
                </CardTitle>
                {getStatusBadge(report.status || "pending")}
              </CardHeader>

              <CardContent
                className={`space-y-4 ${
                  bulkMode && report.status === "pending" ? "pl-12" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {t("partnerPage.components.sos.location")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("partnerPage.components.sos.coordinates")}:{" "}
                      {report.latitude.toFixed(4)},{" "}
                      {report.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {t("partnerPage.components.sos.time")}:{" "}
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                  <span className="font-mono text-xs">ID: {report.id}</span>
                </div>
              </CardContent>

              <CardFooter
                className={`flex justify-end ${
                  bulkMode && report.status === "pending" ? "pl-12" : ""
                }`}
              >
                {report.status === "pending" && (
                  <Button
                    onClick={() => {
                      setSelectedReport(report);
                      fetchAvailablePersonnel();
                      setShowModal(true);
                    }}
                  >
                    {t("partnerPage.components.sos.help")}
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
          {bulkMode && selectedReports.length > 0 && (
            <div className="fixed bottom-4 right-4 z-50">
              <Button
                size="lg"
                onClick={initiateBulkDispatch}
                disabled={personnelList.length === 0 || isBulkDispatching}
              >
                {isBulkDispatching
                  ? "Dispatching..."
                  : `Dispatch ${selectedReports.length} SOS (${personnelList.length} available)`}
              </Button>
            </div>
          )}
        </div>
      )}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md">
            <h3 className="font-semibold text-lg">Confirm Dispatch</h3>
            <p className="my-4">
              You're assigning {selectedReports.length} reports but only{" "}
              {personnelList.length} personnel available.
              {selectedReports.length - personnelList.length} reports won't get
              assigned.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  handleBulkDispatch();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
