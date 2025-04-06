"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Users,
  CreditCard,
  Settings,
  GamepadIcon,
  Trophy,
  Star
} from "lucide-react";

const menuItems = [
  {
    title: "Vue d'ensemble",
    href: "/admin/dashboard",
    icon: BarChart
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard
  },
  {
    title: "Jeux",
    href: "/admin/games",
    icon: GamepadIcon
  },
  {
    title: "Gains",
    href: "/admin/winnings",
    icon: Trophy
  },
  {
    title: "VIP",
    href: "/admin/vip",
    icon: Star
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: Settings
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="pb-12 min-h-screen w-64 bg-zinc-900">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold text-zinc-100">
            Administration
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
