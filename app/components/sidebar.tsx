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
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
  { name: "Resources", href: "/admin/resources", icon: Box },
  { name: "Organizations", href: "/admin/organizations", icon: Building2 },
  { name: "Map", href: "/admin/map", icon: Map },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        <span className="text-lg font-semibold">Admin Dashboard</span>
        {isMobile && (
          <button onClick={onClose} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
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
