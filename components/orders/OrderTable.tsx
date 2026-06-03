"use client";

import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";

interface OrderItem {
  id: string;
  orderedQuantity: any;
  baseQuantity: any;
  orderedUnit: string;
  unitPrice: any;
  totalPrice: any;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: any;
  createdAt: string;
  seller?: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

interface OrderTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: string) => Promise<void>;
  showSellerName?: boolean;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export function OrderTable({
  orders,
  onStatusChange,
  showSellerName = false,
  isAdmin = false,
  isLoading = false,
}: OrderTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (onStatusChange) {
      setUpdatingOrderId(orderId);
      try {
        await onStatusChange(orderId, newStatus);
      } finally {
        setUpdatingOrderId(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    Order {order.orderNumber}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {showSellerName && order.seller && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{order.seller.name}</p>
                      <p className="text-xs text-gray-500">{order.seller.email}</p>
                    </div>
                  )}

                  <div className="text-right">
                    <p className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.id ? null : order.id
                      )
                    }
                  >
                    {expandedOrderId === order.id ? "Hide" : "View"} Details
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatINR(order.totalAmount)}
                  </p>
                </div>
              </div>
            </CardHeader>

            {expandedOrderId === order.id && (
              <CardContent>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Order Items</h4>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="text-left px-3 py-2">Product</th>
                          <th className="text-right px-3 py-2">Qty</th>
                          <th className="text-right px-3 py-2">Unit</th>
                          <th className="text-right px-3 py-2">Base Qty</th>
                          <th className="text-right px-3 py-2">Unit Price</th>
                          <th className="text-right px-3 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-3 py-2">
                              <span className="font-medium">
                                {item.product.name}
                              </span>
                              <p className="text-xs text-gray-500">
                                {item.product.sku}
                              </p>
                            </td>
                            <td className="text-right px-3 py-2">
                              {item.orderedQuantity.toString()}
                            </td>
                            <td className="text-right px-3 py-2">
                              {item.orderedUnit}
                            </td>
                            <td className="text-right px-3 py-2 text-xs text-gray-600">
                              {item.baseQuantity.toString()}
                            </td>
                            <td className="text-right px-3 py-2">
                              {formatINR(item.unitPrice)}
                            </td>
                            <td className="text-right px-3 py-2 font-semibold">
                              {formatINR(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {isAdmin && order.status === "PENDING" && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                        disabled={updatingOrderId === order.id || isLoading}
                      >
                        Confirm Order
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        disabled={updatingOrderId === order.id || isLoading}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
