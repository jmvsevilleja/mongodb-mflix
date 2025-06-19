"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ListTodo, User, Wallet, Users } from "lucide-react"; // Added Smile icon

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/faces", // New "Faces" link
      label: "Faces",
      icon: Users, // Using Smile icon for Faces
    },
    {
      href: "/dashboard",
      label: "Todos",
      icon: ListTodo,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: Wallet,
    },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href === "/dashboard" && pathname === "/dashboard");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
