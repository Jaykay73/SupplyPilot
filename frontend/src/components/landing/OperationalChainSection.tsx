"use client";

import React, { useState } from "react";
import {
  Building2,
  Boxes,
  Factory,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODES = [
  {
    id: "suppliers",
    label: "Suppliers",
    category: "Tier-1 Vendors",
    icon: Building2,
    metric: "8 Qualified",
    details: "Apex BioChem, BioSynth Europe, MedChem SpA. Audited under GMP SOP-SUP-002.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "materials",
    label: "Materials",
    category: "Active APIs & Excipients",
    icon: Boxes,
    metric: "20 Active Codes",
    details: "API-004 Paracetamol Sterile Grade, API-001 Amoxicillin. Lot tracking in Vault-C4.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    id: "production",
    label: "Production",
    category: "Cleanrooms & Lines",
    icon: Factory,
    metric: "2 Sterile Lines",
    details: "Line 1 Sterile & Line 2 Cleanroom. 48hr freeze window for scheduled batch runs.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    id: "inventory",
    label: "Inventory",
    category: "Warehouse Stock",
    icon: Package,
    metric: "Real-time Delta",
    details: "Dynamic safety stock buffers & automated reservation locks on confirmed customer orders.",
    color: "from-emerald-500 to-indigo-500",
  },
  {
    id: "orders",
    label: "Orders",
    category: "Demand Pipeline",
    icon: ShoppingCart,
    metric: "124 Monitored",
    details: "Delivery deadline monitoring, SLA breach alerts, and automated multi-tier risk scoring.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "customers",
    label: "Customers",
    category: "Healthcare Entities",
    icon: Users,
    metric: "Direct Consignees",
    details: "Charité University Hospital, Medix Hospital Solutions, Benelux Pharma Distribution.",
    color: "from-purple-500 to-rose-500",
  },
];

export function OperationalChainSection() {
  const [activeNode, setActiveNode] = useState<string>("materials");

  const currentNode = NODES.find((n) => n.id === activeNode) || NODES[0];

  return (
    <section id="chain" className="py-24 px-6 border-b border-border-subtle bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-accent-emerald mb-3 block">
            End-to-End Traceability
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-4">
            Your operations aren&apos;t separate systems.
            <br />
            <span className="text-text-secondary">They&apos;re one chain.</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Legacy ERPs fragment operational context into departmental silos.
            SupplyPilot maintains a continuous live graph linking supply contracts,
            warehouse lots, line capacity, and clinical delivery schedules.
          </p>
        </div>

        {/* Horizontal Node Network */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          {NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = activeNode === node.id;

            return (
              <div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onClick={() => setActiveNode(node.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group flex flex-col justify-between h-40 shadow-subtle",
                  isSelected
                    ? "bg-surface border-accent-emerald ring-2 ring-accent-emerald/20 scale-[1.02]"
                    : "bg-surface border-border-subtle hover:border-slate-400 hover:bg-surface-secondary/40"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-accent-emerald text-white font-bold"
                          : "bg-surface-secondary text-text-muted group-hover:text-text-primary"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-primary mb-1">
                    {node.label}
                  </h3>
                  <p className="text-[11px] text-text-muted">{node.category}</p>
                </div>

                <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-secondary font-medium">
                    {node.metric}
                  </span>
                  <ChevronRight
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      isSelected ? "text-accent-emerald translate-x-1" : "text-text-muted"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Drawer/Banner */}
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-center text-accent-emerald flex-shrink-0">
              <currentNode.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-text-primary">
                  {currentNode.label} Node
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentNode.category}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {currentNode.details}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <span className="text-xs font-mono text-text-muted">
              Live Link Status: <strong className="text-emerald-600">SYNCHRONIZED</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
