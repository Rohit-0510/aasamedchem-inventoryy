"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/orders");
        const orders = await response.json();

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce(
          (sum: any, order: any) => sum + parseFloat(order.totalAmount),
          0
        );
        const pendingOrders = orders.filter(
          (o: any) => o.status === "PENDING"
        ).length;

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          confirmedOrders: orders.filter((o: any) => o.status === "CONFIRMED")
            .length,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome, {session?.user?.name}!</p>
            </div>

            {isLoading ? (
              <Loading text="Loading dashboard..." />
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {stats?.totalOrders || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-1">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {stats?.pendingOrders || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-1">Confirmed</p>
                        <p className="text-3xl font-bold text-green-600">
                          {stats?.confirmedOrders || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatINR(stats?.totalRevenue || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Orders</CardTitle>
                      <Link href="/orders">
                        <Button variant="secondary" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {recentOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No orders yet. <Link href="/orders/new" className="text-blue-600 hover:underline">Place your first order</Link>
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 border-b">
                            <tr>
                              <th className="text-left px-4 py-2">Order #</th>
                              <th className="text-right px-4 py-2">Amount</th>
                              <th className="text-center px-4 py-2">Status</th>
                              <th className="text-right px-4 py-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">
                                  {order.orderNumber}
                                </td>
                                <td className="text-right px-4 py-2">
                                  {formatINR(order.totalAmount)}
                                </td>
                                <td className="text-center px-4 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "CONFIRMED"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="text-right px-4 py-2 text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
