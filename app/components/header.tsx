"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrgStore } from "@/store/orgStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();
const ADMIN_UID = "da8b1af9-2c88-4db3-8275-b5a501d24318";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const organizationId = useOrgStore((state) => state.organizationId);

  // Step 1: Fetch current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Failed to get user ID", error);
        return;
      }
      setUserId(data.user.id);
    };

    getUser();
  }, []);

  // Step 2: Fetch notifications (initial load)
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("timestamp", { ascending: false });

      if (userId === ADMIN_UID) {
        query = query.is("recipient_id", null);
      } else if (organizationId) {
        query = query.eq("recipient_id", organizationId);
      } else {
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error("Notification fetch error:", error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    };

    fetchNotifications();
  }, [userId, organizationId]);

  // Step 3: Real-time notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new;

          const isForAdmin =
            userId === ADMIN_UID && newNotification.recipient_id === null;
          const isForOrg =
            newNotification.recipient_id &&
            newNotification.recipient_id === organizationId;

          if (isForAdmin || isForOrg) {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, organizationId]);

  // Step 4: Mark notifications as read
  const handleOpenChange = async (open: boolean) => {
    if (!open || unreadCount === 0 || !userId) return;

    let updateQuery = supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

    if (userId === ADMIN_UID) {
      updateQuery = updateQuery.is("recipient_id", null);
    } else {
      updateQuery = updateQuery.eq("recipient_id", organizationId);
    }

    const { error } = await updateQuery;

    if (!error) {
      setUnreadCount(0);
      setNotifications((prev) => prev.filter((n) => !n.read));
    }
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="text-4xl text-red-600 font-[emoji] tracking-[.12em] font-bold md:text-center ">
          त्रyana
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-h-96 overflow-auto"
            >
              {notifications.filter((n) => !n.read).length === 0 ? (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              ) : (
                notifications
                  .filter((n) => !n.read)
                  .map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="font-medium">{n.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.timestamp).toLocaleString()}
                      </span>
                    </DropdownMenuItem>
                  ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
