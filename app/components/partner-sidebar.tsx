"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Box,
  Building2,
  LayoutDashboard,
  Map,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/translation-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Organization, Role, Status } from "../types";

const navigation = [
  {
    name: "ui.partner.components.dashboard",
    key: "Dashboard",
    href: "/partner",
    icon: LayoutDashboard,
  },
  {
    name: "ui.partner.components.alerts",
    key: "Alerts",
    href: "/partner/alerts",
    icon: AlertTriangle,
  },
  {
    name: "ui.partner.components.resources",
    key: "Resources",
    href: "/partner/resources",
    icon: Box,
  },
  {
    name: "ui.partner.components.personnel",
    key: "Personnel",
    href: "/partner/personnel",
    icon: Users,
  },
  {
    name: "ui.partner.components.map",
    key: "Map",
    href: "/partner/map",
    icon: Map,
  },
  {
    name: "ui.partner.components.messages",
    key: "Messages",
    href: "/partner/messages",
    icon: MessageSquare,
  },
  {
    name: "ui.partner.components.organization",
    key: "Organization",
    href: "/partner/organization",
    icon: Building2,
  },
  {
    name: "ui.partner.components.sos",
    key: "SOS",
    href: "/partner/sos",
    icon: AlertTriangle,
  },
  {
    name: "ui.partner.components.settings",
    key: "Settings",
    href: "/partner/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState<Status>("pending");
  const [role, setRole] = useState<Role>("partner");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!user || !session) {
        console.error("Fetching Error: Credential ERROR");
        return;
      }

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("admin_id", user.id)
        .single();

      if (orgError) {
        console.error("Error fetching organization: ", orgError);
        return;
      }

      setStatus(orgData.status);
      setRole(session.user.role as Role);
    };

    fetchUserDetails();
  }, []);

  const filteredNavigation = useMemo(() => {
    if (status === "unapproved" || status === "pending") {
      return navigation.filter((item) =>
        ["Organization", "Settings"].includes(item.key)
      );
    }
    return navigation;
  }, [status]);

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-background transition-transform duration-300 md:relative md:translate-x-0",
    {
      "translate-x-0": isOpen,
      "-translate-x-full": !isOpen && isMobile,
    }
  );

  return (
    <div className={sidebarClasses}>
      <div className="flex h-16 items-center justify-between border-b px-6">
        <span className="text-lg font-semibold">{t("ui.partner.title")}</span>
        {isMobile && (
          <button onClick={onClose} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              {t(item.name)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
