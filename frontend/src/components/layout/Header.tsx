import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGuideTour } from "@/context/GuideTourContext";
import { Modal } from "@/components/shared/Modal";
import {
  Menu,
  Sparkles,
  AlertTriangle,
  Play,
  ShieldCheck,
  User as UserIcon,
  HelpCircle,
  LayoutDashboard,
  Bot,
  CheckSquare,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  actions?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  onOpenMobileMenu,
  actions,
}: HeaderProps) {
  const { user, currentRole } = useAuth();
  const { startTour, isActive } = useGuideTour();
  const router = useRouter();
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border-subtle bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-4">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                {title}
              </h1>
              <Badge variant="emerald" beacon className="hidden sm:inline-flex text-[11px]">
                SYSTEM OPERATIONAL
              </Badge>
            </div>
            {subtitle && (
              <p className="text-xs text-text-muted hidden sm:block mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick actions & Persona info */}
        <div className="flex items-center gap-3">
          {actions}

          {/* Permanent ? Guide Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGuideModalOpen(true)}
            leftIcon={<HelpCircle className="w-3.5 h-3.5 text-purple-600" />}
            className="text-xs border-purple-200 text-purple-800 hover:bg-purple-50 hover:border-purple-300 font-semibold"
          >
            ? Guide
          </Button>

          {user && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border-subtle">
              <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-xs font-semibold text-text-primary">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-medium text-text-primary leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-text-muted capitalize">
                  {currentRole?.replace("_", " ")}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Guide Information Modal (Section 23) */}
      <Modal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        title="What Can I Do Here?"
        subtitle="Quick reference to the 4 core areas of SupplyPilot"
        maxWidth="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle">
              <div className="flex items-center gap-2 font-bold text-xs text-text-primary mb-1">
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Dashboard</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                See current operational risks, top inventory metrics, and simulate supply chain disruptions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle">
              <div className="flex items-center gap-2 font-bold text-xs text-text-primary mb-1">
                <Bot className="w-4 h-4 text-purple-600" />
                <span>Copilot</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Ask SupplyPilot to investigate an issue, evaluate SOP policies, and generate compliant mitigations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle">
              <div className="flex items-center gap-2 font-bold text-xs text-text-primary mb-1">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <span>Approvals</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Review and authorize purchase requisitions that require human sign-off under deterministic rules.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle">
              <div className="flex items-center gap-2 font-bold text-xs text-text-primary mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Activity</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                See what SupplyPilot has done across the complete operational timeline with full audit traceability.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGuideModalOpen(false)}
              className="text-xs"
            >
              Close
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGuideModalOpen(false);
                startTour();
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="text-xs shadow-glow-emerald"
            >
              Start Guided Demo
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
