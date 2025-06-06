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
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { error } from "console";
import { Organization, Role, Status } from "../types";

const navigation = [
  { name: "Dashboard", href: "/partner", icon: LayoutDashboard },
  { name: "Alerts", href: "/partner/alerts", icon: AlertTriangle },
  { name: "Resources", href: "/partner/resources", icon: Box },
  { name: "SOS", href: "/partner/sos", icon: AlertTriangle },
  { name: "Personnel", href: "/partner/personnel", icon: Users },
  { name: "Map", href: "/partner/map", icon: Map },
  { name: "Messages", href: "/partner/messages", icon: MessageSquare },
  { name: "Organization", href: "/partner/organization", icon: Building2 },
  { name: "Settings", href: "/partner/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>("pending");
  const [role, setRole] = useState<Role>("partner");
  const supabase = createClientComponentClient();
  const [Navigation, setNavigation] = useState(navigation);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setIsLoading(true);

    fetchUserDetails();
    setIsLoading(false);
  }, []);

  const fetchUserDetails = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    // console.log(user?.identities);
    // console.log(session?.user.role);/
    if (!user || !session) {
      throw new Error("Fettching Error Credential ERROR");
    }

    // console.log(user?.id);

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
    setRole(session?.user.role as Role);
    // console.log(orgData);
  };
  // console.log(Navigation);
  useEffect(() => {
    // setIsLoading(true);

    const filetrNavigation = () => {
      if (status === "unapproved" || status === "pending") {
        setNavigation(
          navigation.filter((item) => {
            return item.name === "Organization" || item.name === "Settings";
          })
        );
      } else if (status === "approved" || status === "active") {
        setNavigation(navigation);
      }
    };

    filetrNavigation();

    // setIsLoading(false);
  }, [role, status]);

  console.log(Navigation);

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
        <span className="text-lg font-semibold">Partner Dashboard</span>
        {isMobile && (
          <button onClick={onClose} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {Navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
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
                className={cn("mr-3 h-5 w-5 flex-shrink-0")}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
