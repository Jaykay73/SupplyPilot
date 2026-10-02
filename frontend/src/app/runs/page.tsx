"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { AgentRunItem } from "@/types/api";
import { RunDetailModal } from "@/components/runs/RunDetailModal";
import { Badge } from "@/components/shared/Badge";
import { StatusChip } from "@/components/shared/StatusChip";
import { Button } from "@/components/shared/Button";
import { MetricCard } from "@/components/shared/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/utils";
import {
  Terminal,
  Cpu,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AgentRunsPage() {
  const router = useRouter();
  const [selectedRun, setSelectedRun] = useState<AgentRunItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: () => api.runs.list(),
    refetchInterval: 10000,
  });

  const completedCount = runs.filter((r) => r.status === "COMPLETED").length;
  const waitingApprovalCount = runs.filter((r) => r.status === "WAITING_APPROVAL").length;

  const handleOpenDetail = (run: AgentRunItem) => {
    setSelectedRun(run);
    setModalOpen(true);
  };

  return (
    <AppShell
      title="Agent Execution Runs & Telemetry"
      subtitle="Historical LangGraph agent reasoning traces, autonomous tool selections & execution latencies"
      headerActions={
        <Button
          variant="purple"
          size="sm"
          onClick={() => router.push("/agent")}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          New Agent Session
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sessions"
            value={runs.length}
            subtitle="Autonomous workflow runs"
            icon={<Terminal className="w-4 h-4 text-emerald-600" />}
          />
          <MetricCard
            title="Completed Runs"
            value={completedCount}
            subtitle="Fully resolved inquiries"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            variant="success"
          />
          <MetricCard
            title="Staged in Approvals"
            value={waitingApprovalCount}
            subtitle="Mandated human sign-off"
            icon={<Clock className="w-4 h-4 text-purple-600" />}
            variant="purple"
          />
          <MetricCard
            title="Mean Latency"
            value="84 ms"
            subtitle="Deterministic sub-graph speed"
            icon={<Cpu className="w-4 h-4 text-cyan-600" />}
          />
        </div>

        {/* Runs Table */}
        <div className="rounded-2xl bg-surface border border-border-subtle shadow-elevation overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-secondary/80 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Run ID</th>
                  <th className="p-4">Goal / Operational Prompt</th>
                  <th className="p-4">Caller Role</th>
                  <th className="p-4">Created Timestamp</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-4 bg-surface-secondary/20 h-14" />
                    </tr>
                  ))
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <EmptyState
                        icon="inbox"
                        title="No Agent Sessions Recorded"
                        description="Execute an inquiry in the AI Copilot to log your first autonomous run."
                      />
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => handleOpenDetail(run)}
                      className="hover:bg-surface-secondary/40 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 font-bold text-text-primary group-hover:text-purple-600">
                        {run.id.slice(0, 8)}...
                      </td>
                      <td className="p-4 font-sans text-slate-800 font-medium max-w-md truncate">
                        {run.goal}
                      </td>
                      <td className="p-4 uppercase text-text-muted">
                        {run.user_role}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {formatDateTime(run.created_at)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant={run.status === "COMPLETED" ? "emerald" : "amber"}
                          className="text-[10px] font-mono"
                        >
                          {run.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(run);
                          }}
                          className="text-xs h-7 px-2 text-text-muted group-hover:text-text-primary"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Telemetry Modal */}
      <RunDetailModal
        run={selectedRun}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppShell>
  );
}
