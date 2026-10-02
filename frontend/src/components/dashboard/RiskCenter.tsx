"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AtRiskOrder } from "@/types/api";
import { AlertTriangle, Sparkles, ArrowRight, ShieldAlert, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RiskCenterProps {
  orders: AtRiskOrder[];
  isLoading: boolean;
}

export function RiskCenter({ orders, isLoading }: RiskCenterProps) {
  const router = useRouter();

  const handleInvestigate = (orderNumber: string) => {
    const encodedPrompt = encodeURIComponent(
      `Can we fulfill Medix's order ${orderNumber} by October 20?`
    );
    router.push(`/agent?order=${orderNumber}&prompt=${encodedPrompt}`);
  };

  return (
    <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-secondary/40">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-text-primary tracking-tight">
              Operational Risk Center
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              {orders.length} Active Alerts
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Deterministic risk detection linking supplier delays, warehouse stock, and production freeze windows.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/orders")}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          View All Orders
        </Button>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-border-subtle/70">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-text-muted">
            Evaluating real-time ERP risk models...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-emerald-600 text-sm font-medium">
              No orders currently at critical risk. All supply chains operational.
            </span>
          </div>
        ) : (
          orders.map((order) => {
            const riskScore = order.risk_score ?? 72;
            const isHigh = order.risk_level === "HIGH" || order.risk_level === "CRITICAL";

            return (
              <div
                key={order.order_number}
                className="p-6 hover:bg-surface-secondary/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Order Info & Risk Score Gauge */}
                <div className="flex items-start sm:items-center gap-5">
                  {/* Technical Risk Score Badge */}
                  <div
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border flex-shrink-0 shadow-subtle ${
                      isHigh
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    <span className="text-xl font-bold font-mono leading-none">
                      {riskScore}
                    </span>
                    <span className="text-[9px] font-mono tracking-wider uppercase mt-1 font-semibold">
                      {order.risk_level}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-base text-text-primary">
                        {order.order_number}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="text-sm text-text-secondary font-medium">
                        {order.customer_name}
                      </span>
                      <Badge
                        variant={isHigh ? "red" : "amber"}
                        beacon={isHigh}
                        className="text-[10px]"
                      >
                        {order.risk_level} RISK
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-muted font-mono mt-1.5">
                      {order.total_amount && (
                        <span className="flex items-center gap-1 text-text-secondary">
                          <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                          Value: {formatCurrency(order.total_amount)}
                        </span>
                      )}
                      {order.delivery_deadline && (
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          Deadline: {formatDate(order.delivery_deadline)}
                        </span>
                      )}
                      {order.product_name && (
                        <span>Product: {order.product_name}</span>
                      )}
                    </div>

                    <div className="mt-2.5 p-2 rounded-lg bg-surface-secondary border border-border-subtle inline-flex items-center gap-2 text-xs">
                      <span className="text-text-muted font-mono text-[11px]">Primary Risk Driver:</span>
                      <span className="text-amber-700 font-semibold font-mono">
                        {order.primary_risk_driver || order.primary_risk_reason || "Component deficit"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 self-end lg:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/orders?search=${order.order_number}`)}
                    className="text-xs"
                  >
                    View Order
                  </Button>

                  <Button
                    variant="purple"
                    size="sm"
                    onClick={() => handleInvestigate(order.order_number)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    className="text-xs shadow-glow-purple"
                  >
                    Investigate with Copilot
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
