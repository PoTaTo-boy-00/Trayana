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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";

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

type Status = "pending" | "dispatched" | "resolved";
type BadgeVariant = "destructive" | "default" | "secondary" | "outline";

export default function SOSPage() {
  const [reports, setReports] = useState<SOSReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Fetch available personnel
  const fetchAvailablePersonnel = async () => {
    const { data, error } = await supabase
      .from("personnel")
      .select("*")
      .eq("status", "available");

    if (error) {
      toast.error("Failed to fetch personnel");
      return;
    }

    setPersonnelList(data || []);
  };

  // Handle bulk dispatch
  const handleBulkDispatch = async (personnelId: string) => {
    try {
      const reportsToDispatch = reports.filter((r) =>
        selectedReports.includes(r.id)
      );

      // 1. Update personnel status
      const { error: personnelError } = await supabase
        .from("personnel")
        .update({ status: "deployed" })
        .eq("id", personnelId);

      if (personnelError) throw personnelError;

      // 2. Move reports to history
      const { error: historyError } = await supabase.from("sos_history").insert(
        reportsToDispatch.map((report) => ({
          ...report,
          status: "dispatched",
          personnel: personnelId,
          dispatched_at: new Date().toISOString(),
        }))
      );

      if (historyError) throw historyError;

      // 3. Delete from active reports
      const { error: deleteError } = await supabase
        .from("sosReport")
        .delete()
        .in("id", selectedReports);

      if (deleteError) throw deleteError;

      // 4. Update UI
      setReports((prev) => prev.filter((r) => !selectedReports.includes(r.id)));
      setSelectedReports([]);
      toast.success(`Dispatched to ${reportsToDispatch.length} reports`);
      setShowDispatchModal(false);
    } catch (err) {
      console.error("Bulk dispatch failed:", err);
      toast.error("Dispatch failed");
    }
  };

  // Toggle select all reports
  const toggleSelectAll = () => {
    setSelectedReports((prev) =>
      prev.length === reports.length ? [] : reports.map((r) => r.id)
    );
  };

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("sosReport")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setReports(
          data?.map((report) => ({
            ...report,
            status: report.status || "pending",
          })) || []
        );
      } catch (error) {
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
        { event: "*", schema: "public", table: "sosReport" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setReports((prev) => [
              { ...(payload.new as SOSReport), status: "pending" },
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

  // Status badge component
  const getStatusBadge = (status: Status) => {
    const variants: Record<
      Status,
      {
        variant: BadgeVariant;
        icon: React.ReactNode;
        text: string;
      }
    > = {
      pending: {
        variant: "destructive",
        icon: <Clock className="h-3 w-3" />,
        text: "Pending",
      },
      dispatched: {
        variant: "default",
        icon: <Clock className="h-3 w-3" />,
        text: "Dispatched",
      },
      resolved: {
        variant: "default",
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Resolved",
      },
    };

    const current = variants[status];

    return (
      <Badge variant={current.variant} className="flex items-center gap-1">
        {current.icon}
        {current.text}
      </Badge>
    );
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {t("partnerPage.components.sos.title")}
        </h1>
        {reports.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleSelectAll}>
              {selectedReports.length === reports.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            {selectedReports.length > 0 && (
              <Button
                onClick={() => {
                  fetchAvailablePersonnel();
                  setShowDispatchModal(true);
                }}
              >
                Dispatch ({selectedReports.length})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">
              Dispatch to {selectedReports.length} Reports
            </h2>
            {personnelList.length === 0 ? (
              <p>No available personnel</p>
            ) : (
              <ul className="space-y-2">
                {personnelList.map((person) => (
                  <li key={person.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleBulkDispatch(person.id)}
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
              onClick={() => setShowDispatchModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reports List */}
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
            <Card
              key={report.id}
              className={
                selectedReports.includes(report.id)
                  ? "border-2 border-primary"
                  : ""
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={(checked) => {
                      setSelectedReports((prev) =>
                        checked
                          ? [...prev, report.id]
                          : prev.filter((id) => id !== report.id)
                      );
                    }}
                  />
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <AlertTriangle className="text-red-500" />
                    {t("partnerPage.components.sos.header")}
                  </CardTitle>
                </div>
                {getStatusBadge(report.status || "pending")}
              </CardHeader>

              <CardContent className="space-y-4">
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

              <CardFooter className="flex justify-between">
                {report.personnel && (
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {report.personnel}
                  </p>
                )}
                {report.status === "pending" && (
                  <Button
                    onClick={() => {
                      setSelectedReports([report.id]);
                      fetchAvailablePersonnel();
                      setShowDispatchModal(true);
                    }}
                  >
                    {t("partnerPage.components.sos.help")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
