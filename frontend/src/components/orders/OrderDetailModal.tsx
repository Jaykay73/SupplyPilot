"use client";

import React from "react";
import { Order, OrderRiskAssessment } from "@/types/api";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { StatusChip } from "@/components/shared/StatusChip";
import { Badge } from "@/components/shared/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingCart,
  Calendar,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Boxes,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderDetailModalProps {
  order: Order | null;
  riskAssessment?: OrderRiskAssessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  order,
  riskAssessment,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const router = useRouter();

  if (!order) return null;

  const handleInvestigate = () => {
    onClose();
    const prompt = encodeURIComponent(
      `Can we fulfill Medix's order ${order.order_number} by October 20?`
    );
    router.push(`/agent?order=${order.order_number}&prompt=${prompt}`);
  };

  const riskScore = riskAssessment?.composite_risk_score ?? (order.risk_level === "HIGH" ? 72 : 25);
  const isHighRisk = order.risk_level === "HIGH" || order.risk_level === "CRITICAL";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.order_number}`}
      subtitle={`${order.customer_name} · Requested Delivery: ${formatDate(order.requested_delivery_date)}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Header Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-secondary border border-border-subtle text-xs font-mono">
          <div>
            <span className="text-text-muted text-[10px] block">TOTAL AMOUNT</span>
            <span className="text-emerald-600 font-bold text-sm">
              {formatCurrency(order.total_amount, order.currency)}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">STATUS</span>
            <StatusChip status={order.status} />
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">PRIORITY</span>
            <span className="text-text-primary font-bold uppercase">{order.priority}</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">ORDER DATE</span>
            <span className="text-text-secondary">{formatDate(order.order_date)}</span>
          </div>
        </div>

        {/* Deterministic Risk Breakdown Panel */}
        <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-text-primary uppercase font-mono">
                Deterministic Risk Assessment
              </h4>
            </div>
            <Badge variant={isHighRisk ? "red" : "slate"}>
              Composite Score: {riskScore} / 100
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle shadow-subtle">
              <span className="text-text-muted text-[10px] block">INVENTORY RISK</span>
              <span className="text-rose-700 font-bold">
                {riskAssessment?.inventory_risk ?? (isHighRisk ? 80 : 15)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle shadow-subtle">
              <span className="text-text-muted text-[10px] block">SUPPLIER RISK</span>
              <span className="text-amber-700 font-bold">
                {riskAssessment?.supplier_risk ?? (isHighRisk ? 65 : 20)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle shadow-subtle">
              <span className="text-text-muted text-[10px] block">PRODUCTION RISK</span>
              <span className="text-emerald-700 font-bold">
                {riskAssessment?.production_risk ?? (isHighRisk ? 70 : 10)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle shadow-subtle text-xs flex items-center justify-between">
            <span className="text-text-muted font-mono text-[11px]">Primary Driver:</span>
            <span className="text-amber-700 font-bold font-mono">
              {riskAssessment?.primary_risk_driver || order.risk_reason || "Component deficit (API-004)"}
            </span>
          </div>
        </div>

        {/* Ordered Line Items */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase font-mono">
            <Package className="w-4 h-4 text-accent-emerald" />
            <span>Ordered Line Items ({order.items?.length || 0})</span>
          </div>

          <div className="rounded-xl border border-border-subtle overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-secondary/80 text-text-muted border-b border-border-subtle">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-secondary/30">
                    <td className="p-3 font-bold text-text-primary">{item.product_sku}</td>
                    <td className="p-3 text-text-secondary">{item.product_name}</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">
                      {item.quantity.toLocaleString()} vials
                    </td>
                    <td className="p-3 text-right text-text-muted">
                      {formatCurrency(item.unit_price, order.currency)}
                    </td>
                    <td className="p-3 text-right font-bold text-text-primary">
                      {formatCurrency(item.subtotal || item.quantity * item.unit_price, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          <Button
            variant="purple"
            size="sm"
            onClick={handleInvestigate}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="text-xs shadow-glow-purple"
          >
            Investigate with Copilot
          </Button>
        </div>
      </div>
    </Modal>
  );
}
