"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;

  const navItems = {
    SELLER: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/products", label: "Browse Products", icon: "📦" },
      { href: "/orders/new", label: "Place Order", icon: "🛒" },
      { href: "/orders", label: "My Orders", icon: "📋" },
    ],
    ADMIN: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/admin/products", label: "Manage Products", icon: "📦" },
      { href: "/admin/orders", label: "All Orders", icon: "📋" },
    ],
  };

  const items = navItems[role as keyof typeof navItems] || [];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">AASA MedChem</h2>
        <p className="text-xs text-gray-400">Pharmaceutical Inventory</p>
      </div>

      <nav className="mt-8">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-6 py-3 transition-colors ${
              isActive(item.href)
                ? "bg-blue-600 border-r-4 border-blue-400"
                : "hover:bg-gray-800"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
