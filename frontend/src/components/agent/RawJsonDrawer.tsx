"use client";

import React, { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Copy, Check, Terminal } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { toast } from "sonner";

interface RawJsonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

export function RawJsonDrawer({ isOpen, onClose, title, data }: RawJsonDrawerProps) {
  const [copied, setCopied] = useState(false);

  const formatted = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Complete deterministic JSON payload returned by backend API"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <Terminal className="w-3.5 h-3.5 text-accent-purple" />
            <span>application/json · {formatted.split("\n").length} lines</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs h-7"
          >
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle max-h-[60vh] overflow-y-auto">
          <pre className="text-xs font-mono text-emerald-800 leading-relaxed whitespace-pre-wrap break-all">
            {formatted}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
