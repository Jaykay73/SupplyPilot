"use client";

import React, { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { XCircle, AlertTriangle } from "lucide-react";

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvalId: string;
  requestNumber: string;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
}

export function RejectReasonModal({
  isOpen,
  onClose,
  approvalId,
  requestNumber,
  onConfirm,
  isLoading,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isLoading) return;
    await onConfirm(reason);
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reject Requisition ${requestNumber}`}
      subtitle="Rejection will be immutably recorded in the cryptographic audit trail"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p>
            Rejecting this requisition cancels the staged purchase order and returns the customer order to an unresolved shortage state.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
            Mandatory Rejection Rationale
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g. Unit price exceeds budgetary envelope; investigate alternative air shipment..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={isLoading}
            disabled={!reason.trim() || isLoading}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
}
