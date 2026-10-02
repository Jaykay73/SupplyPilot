"use client";

import React, { useState } from "react";
import {
  Boxes,
  ShoppingCart,
  Factory,
  Truck,
  Code,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { RawJsonDrawer } from "./RawJsonDrawer";
import { formatCurrency } from "@/lib/utils";

interface EvidenceTabProps {
  evidence?: Record<string, any>;
}

export function EvidenceTab({ evidence }: EvidenceTabProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  const order = evidence?.order;
  const inventory = evidence?.finished_inventory || evidence?.inventory;
  const shortage = evidence?.material_shortage || evidence?.bom_shortage;
  const suppliers = evidence?.supplier_recommendation || evidence?.supplier_candidates;
  const capacity = evidence?.production_capacity || evidence?.capacity;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs font-mono">
        <span className="text-text-muted">ERP & WMS Retrieved Artifacts</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRawJson(true)}
          leftIcon={<Code className="w-3.5 h-3.5" />}
          className="text-xs h-7 px-2.5"
        >
          View Raw Payload
        </Button>
      </div>

      {/* 1. Order Evidence */}
      <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border-subtle space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
          <ShoppingCart className="w-4 h-4 text-blue-400" />
          <span>Customer Order Specifications</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div>
            <span className="text-text-muted text-[10px] block">ORDER ID</span>
            <span className="text-text-primary font-bold">
              {order?.order_number || "ORD-1847"}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">CONSIGNEE</span>
            <span className="text-text-primary font-bold">
              {order?.customer_name || "Medix Hospital Solutions"}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">DELIVERY DEADLINE</span>
            <span className="text-text-secondary">
              {order?.delivery_deadline || order?.requested_date || "2026-10-20"}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">REQUESTED QUANTITY</span>
            <span className="text-emerald-600 font-bold">
              {order?.requested_quantity || "5,000 vials (PRD-004)"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BOM Component Shortage Calculation */}
      <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span>Bill of Materials (BOM) Deficit Calculation</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
            NET SHORTAGE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-surface border border-border-subtle text-xs font-mono text-center shadow-subtle">
          <div>
            <span className="text-text-muted text-[10px] block">REQUIRED</span>
            <span className="text-text-primary font-bold">1,500 kg</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">AVAILABLE</span>
            <span className="text-text-secondary font-bold">800 kg</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">DEFICIT</span>
            <span className="text-rose-600 font-bold">-700 kg (API-004)</span>
          </div>
        </div>
        <p className="text-[11px] text-text-muted">
          Active substance deficit blocks compounding batch initiation in Cleanroom Line 1.
        </p>
      </div>

      {/* 3. Qualified Supplier Recommendation */}
      <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-text-primary">
            <Truck className="w-4 h-4 text-accent-emerald" />
            <span>Dual-Sourcing Supplier Evaluation</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold">
            GMP Certified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div>
            <span className="text-text-muted text-[10px] block">RECOMMENDED VENDOR</span>
            <span className="text-emerald-600 font-bold">
              Apex BioChem GmbH (SUP-001)
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">RELIABILITY SLA</span>
            <span className="text-text-primary font-bold">
              96.0% On-Time (Grade A)
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">UNIT PRICING</span>
            <span className="text-text-secondary">€5.60 / kg (€8,400.00 Total)</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">TRANSIT LEAD TIME</span>
            <span className="text-text-primary font-bold">5 Days (ETA Oct 6)</span>
          </div>
        </div>
      </div>

      {/* Raw JSON inspection drawer */}
      <RawJsonDrawer
        isOpen={showRawJson}
        onClose={() => setShowRawJson(false)}
        title="Retrieved ERP Evidence Payload"
        data={evidence || { status: "Empty or demo evidence state" }}
      />
    </div>
  );
}
