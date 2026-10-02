"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { Order, OrderRiskAssessment } from "@/types/api";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { StatusChip } from "@/components/shared/StatusChip";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  ShoppingCart,
  Filter,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.list({ limit: 100 }),
  });

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesRisk =
        riskFilter === "ALL" ||
        order.risk_level?.toLowerCase() === riskFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [orders, search, statusFilter, riskFilter]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <AppShell
      title="Customer Demand & Orders"
      subtitle="Fulfillment pipeline, delivery commitments & multi-tier operational risk"
    >
      <div className="space-y-6">
        {/* Controls Bar: Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # (e.g. ORD-1847) or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-secondary/70 p-1 rounded-lg border border-border-subtle text-xs">
              <span className="text-text-muted px-2 text-[10px] font-mono uppercase">Status:</span>
              {["ALL", "CONFIRMED", "PROCESSING", "PENDING"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-surface text-text-primary font-bold shadow-subtle border border-border"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-surface-secondary/70 p-1 rounded-lg border border-border-subtle text-xs">
              <span className="text-text-muted px-2 text-[10px] font-mono uppercase">Risk:</span>
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    riskFilter === r
                      ? "bg-surface text-text-primary font-bold shadow-subtle border border-border"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-surface border border-border-subtle shadow-elevation overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-secondary/80 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Delivery Deadline</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-center">Risk Level</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="p-4 bg-surface-secondary/20 h-14" />
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <EmptyState
                        icon="inbox"
                        title="No Orders Match Your Query"
                        description="Try refining your search terms or resetting the status and risk filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isHigh = order.risk_level === "HIGH" || order.risk_level === "CRITICAL";
                    return (
                      <tr
                        key={order.order_id || order.order_number}
                        onClick={() => handleOpenDetail(order)}
                        className="hover:bg-surface-secondary/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-4 font-bold text-text-primary group-hover:text-purple-700 transition-colors">
                          {order.order_number}
                        </td>
                        <td className="p-4 text-text-primary font-sans font-medium">
                          {order.customer_name}
                        </td>
                        <td className="p-4">
                          <StatusChip status={order.status} />
                        </td>
                        <td className="p-4 uppercase text-text-muted">
                          {order.priority}
                        </td>
                        <td className="p-4 text-text-secondary">
                          {formatDate(order.requested_delivery_date)}
                        </td>
                        <td className="p-4 text-right font-bold text-emerald-600">
                          {formatCurrency(order.total_amount, order.currency)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant={isHigh ? "red" : order.risk_level === "MEDIUM" ? "amber" : "slate"}
                            beacon={isHigh}
                            className="text-[10px]"
                          >
                            {order.risk_level || "LOW"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(order);
                            }}
                            className="text-xs h-7 px-2 text-text-muted group-hover:text-text-primary"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border-subtle bg-surface-secondary/30 flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
            <span>Real-time ERP Synchronization Active</span>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppShell>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-text-muted font-mono text-xs">
          Loading Orders Directory...
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
