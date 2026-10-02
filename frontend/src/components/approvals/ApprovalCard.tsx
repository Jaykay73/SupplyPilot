"use client";

import React, { useState } from "react";
import { ApprovalItem } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Lock,
  ShieldAlert,
  ArrowRight,
  Calendar,
  Building2,
  Boxes,
  User,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { StatusChip } from "@/components/shared/StatusChip";
import { RejectReasonModal } from "./RejectReasonModal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { TourHighlightWrapper } from "@/components/shared/TourSpotlight";

interface ApprovalCardProps {
  approval: ApprovalItem;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isProcessing: boolean;
}

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  isProcessing,
}: ApprovalCardProps) {
  const { user, canApprove } = useAuth();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const check = canApprove(approval.required_role, approval.monetary_value);
  const isPending = approval.status === "PENDING";
  const evidence = approval.supporting_evidence || {};

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border-subtle shadow-subtle hover:border-slate-300 transition-all duration-200 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-text-primary font-mono">
                {approval.request_number}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary text-text-secondary border border-border-subtle uppercase font-semibold">
                {approval.action_type}
              </span>
            </div>
            <span className="text-xs text-text-muted">
              Created {formatDateTime(approval.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusChip status={approval.status} />
          <Badge variant="amber" className="text-[10px] font-mono">
            {approval.risk_level} Risk
          </Badge>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-primary leading-relaxed">
          {approval.action_summary}
        </h4>

        {/* Technical Key Data Points */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-secondary border border-border-subtle text-xs font-mono">
          <div>
            <span className="text-text-muted text-[10px] block">MONETARY VALUE</span>
            <span className="text-emerald-600 font-bold text-sm">
              {formatCurrency(approval.monetary_value, approval.currency)}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">MANDATED ROLE</span>
            <span className="text-purple-700 font-bold uppercase">
              {approval.required_role?.replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">TARGET MATERIAL</span>
            <span className="text-text-primary">
              {evidence.material_code || "API-004 Paracetamol"}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">TARGET ORDER</span>
            <span className="text-text-primary font-bold">
              {evidence.order_number || "ORD-1847"}
            </span>
          </div>
        </div>
      </div>

      {/* RBAC Status Banner & Actions */}
      <div className="pt-2 border-t border-border-subtle/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status / Restriction message */}
        <div className="flex-1">
          {isPending ? (
            !check.authorized ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{check.reason}</span>
              </div>
            ) : (
              <div className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Authorized as {user?.roles?.[0]?.replace("_", " ")}</span>
              </div>
            )
          ) : (
            <div className="text-xs font-mono text-text-muted">
              Resolved by <strong className="text-text-primary">{approval.resolved_by || "System"}</strong> at{" "}
              {formatDateTime(approval.resolved_at)}
            </div>
          )}
        </div>

        {/* Buttons */}
        {isPending && (
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="danger"
              size="sm"
              disabled={isProcessing}
              onClick={() => setRejectModalOpen(true)}
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reject Action
            </Button>

            <TourHighlightWrapper targetId="tour-btn-authorize">
              <Button
                variant="primary"
                size="sm"
                disabled={!check.authorized || isProcessing}
                isLoading={isProcessing}
                onClick={() => onApprove(approval.id)}
                leftIcon={!check.authorized ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs shadow-glow-emerald px-4 font-bold"
              >
                Authorize Action
              </Button>
            </TourHighlightWrapper>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <RejectReasonModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        approvalId={approval.id}
        requestNumber={approval.request_number}
        isLoading={isProcessing}
        onConfirm={async (reason) => {
          await onReject(approval.id, reason);
          setRejectModalOpen(false);
        }}
      />
    </div>
  );
}
