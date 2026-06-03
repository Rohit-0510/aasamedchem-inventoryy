"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">AASA Inventory</h1>
          <p className="text-xs text-gray-500">Inventory & Order Management</p>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {(session.user as any).role?.toLowerCase()}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
