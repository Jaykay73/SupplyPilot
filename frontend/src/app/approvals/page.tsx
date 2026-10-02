"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalCard } from "@/components/approvals/ApprovalCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useGuideTour } from "@/context/GuideTourContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { toast } from "sonner";
import { ShieldCheck, CheckSquare, Clock, Filter, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ApprovalsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentRole, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch approvals
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["approvals", statusFilter],
    queryFn: () => api.approvals.list(statusFilter === "ALL" ? undefined : statusFilter),
    refetchInterval: 8000,
  });

  const { advanceTo, isStep } = useGuideTour();
  const [justApproved, setJustApproved] = useState<boolean>(false);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      setProcessingId(id);
      return api.approvals.approve(id);
    },
    onSuccess: (data) => {
      setJustApproved(true);
      advanceTo("activity-complete");
      toast.success("Action Authorized & Executed", {
        description: data.message || "Requisition transitioned to APPROVED state and staged in ERP.",
      });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
    onError: (err: any) => {
      toast.error("Authorization Failed", {
        description: err.message,
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      setProcessingId(id);
      return api.approvals.reject(id, reason);
    },
    onSuccess: () => {
      toast.warning("Requisition Rejected", {
        description: "Requisition rejected and logged in immutable audit trail.",
      });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
    onError: (err: any) => {
      toast.error("Rejection Failed", {
        description: err.message,
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  return (
    <AppShell
      title="Human-in-the-Loop Approvals Center"
      subtitle="Authoritative sign-off queue for staged purchase requisitions and schedule adjustments"
    >
      <div className="space-y-6">
        {/* RBAC Info Banner */}
        <div className="p-4 rounded-xl bg-surface border border-purple-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Active Governance Persona:{" "}
                <span className="text-purple-700 font-mono uppercase font-semibold">
                  {user?.full_name} ({currentRole.replace("_", " ")})
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Financial thresholds enforced: €5k autonomous · up to €25k Procurement Officer · &gt;€25k Operations Manager.
              </p>
            </div>
          </div>

          <Badge variant="purple" className="text-xs font-mono self-start sm:self-auto">
            Deterministic Rule Gate Active
          </Badge>
        </div>

        {/* Action Complete Banner (Section 19) */}
        {justApproved && (
          <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-elevation animate-in fade-in duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                  ACTION COMPLETE
                </span>
                <h4 className="text-base font-bold text-text-primary">
                  Purchase request approved & staged in ERP.
                </h4>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  ORD-1847 · API-004 · Recorded in SupplyPilot activity.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                advanceTo("activity-complete");
                router.push("/audit");
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-glow-emerald text-xs font-bold"
            >
              View Activity Trail
            </Button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: "PENDING", label: "Pending Sign-off" },
              { id: "APPROVED", label: "Approved History" },
              { id: "REJECTED", label: "Rejected History" },
              { id: "ALL", label: "All Records" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === f.id
                    ? "bg-white text-text-primary border border-border-subtle font-semibold shadow-sm"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-text-muted">
            {approvals.length} Requisitions Loaded
          </span>
        </div>

        {/* Approvals List */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-text-muted font-mono animate-pulse">
            Loading queued approval requests from database...
          </div>
        ) : approvals.length === 0 ? (
          <EmptyState
            icon="check"
            title="No Pending Approvals"
            description="All operational purchase requests and schedule amendments have been authorized or resolved. Systems are currently nominal."
          />
        ) : (
          <div className="space-y-4">
            {approvals.map((appr) => (
              <ApprovalCard
                key={appr.id}
                approval={appr}
                isProcessing={processingId === appr.id}
                onApprove={async (id) => {
                  await approveMutation.mutateAsync(id);
                }}
                onReject={async (id, reason) => {
                  await rejectMutation.mutateAsync({ id, reason });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
