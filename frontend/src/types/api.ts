export type RoleType = 
  | "procurement_officer" 
  | "operations_manager" 
  | "production_planner" 
  | "admin" 
  | string;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  department: string;
  roles: RoleType[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  full_name: string;
  department: string;
  roles: RoleType[];
}

export interface AtRiskOrder {
  order_id?: string;
  order_number: string;
  customer_name: string;
  product_name?: string;
  requested_quantity?: number;
  requested_delivery_date?: string;
  delivery_deadline?: string;
  total_amount?: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risk_score?: number;
  primary_risk_driver?: string;
  primary_risk_reason?: string;
  recommended_action?: string;
}

export interface DashboardPendingApproval {
  id: string;
  request_number: string;
  action_type: string;
  action_summary: string;
  monetary_value: number;
  required_role: RoleType;
  risk_level: string;
  created_at: string;
}

export interface DashboardRecentRun {
  id: string;
  goal: string;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  total_orders: number;
  open_orders: number;
  raw_materials_count: number;
  products_count: number;
  suppliers_count: number;
  active_batches_count: number;
  at_risk_orders_count: number;
  pending_approvals_count: number;
  at_risk_orders: AtRiskOrder[];
  pending_approvals: DashboardPendingApproval[];
  recent_agent_runs: DashboardRecentRun[];
}

export interface OrderItem {
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  fulfilled_quantity?: number;
  subtotal?: number;
}

export interface Order {
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_code?: string;
  order_date: string;
  requested_delivery_date: string;
  status: "confirmed" | "processing" | "pending" | "shipped" | "cancelled" | string;
  priority: "NORMAL" | "HIGH" | "EXPEDITED" | string;
  currency: string;
  total_amount: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  risk_reason?: string | null;
  items: OrderItem[];
}

export interface OrderRiskAssessment {
  order_number: string;
  composite_risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  inventory_risk: number;
  supplier_risk: number;
  production_risk: number;
  primary_risk_driver: string;
}

export interface InventoryItem {
  item_id: string;
  item_code: string;
  item_name: string;
  item_type: "material" | "product";
  on_hand: number;
  reserved: number;
  available: number;
  incoming: number;
  unit: string;
  warehouse_location: string;
  safety_stock: number;
  is_below_safety_stock: boolean;
  reorder_point?: number;
  grade?: string;
  dosage_form?: string;
  strength?: string;
  standard_batch_size?: number;
}

export interface SupplierCatalogItem {
  material_code: string;
  material_name: string;
  unit_price: number;
  lead_time_days: number;
  qualification_status: string;
  is_approved: boolean;
}

export interface SupplierItem {
  id: string;
  supplier_code: string;
  name: string;
  country: string;
  reliability_score: number;
  status: "ACTIVE" | "INACTIVE" | "RESTRICTED" | string;
  contact_email: string;
  qualified_materials: SupplierCatalogItem[];
}

export interface ProductionBatch {
  id: string;
  batch_number: string;
  product_sku: string;
  product_name: string;
  target_quantity: number;
  status: "SCHEDULED" | "RUNNING" | "STALLED_SHORTAGE" | "COMPLETED" | string;
  scheduled_start_date: string;
  scheduled_end_date: string;
  line_id: string;
  block_reason?: string | null;
}

export interface ProductionLine {
  id: string;
  line_code: string;
  name: string;
  category: string;
  daily_capacity_hours: number;
  efficiency_factor: number;
}

export interface ApprovalItem {
  id: string;
  request_number: string;
  action_type: "PURCHASE_REQUEST" | "PRODUCTION_RESCHEDULE" | "CUSTOMER_COMMUNICATION" | string;
  action_summary: string;
  monetary_value: number;
  currency: string;
  required_role: RoleType;
  risk_level: string;
  jev_recommendation?: any;
  supporting_evidence?: any;
  policy_citations?: any[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  agent_run_id?: string | null;
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  events?: Array<{
    id: string;
    actor_id: string;
    actor_role: string;
    event_type: string;
    reason: string;
    timestamp: string;
  }>;
}

export interface PolicyCitation {
  document_title?: string;
  section_name?: string;
  policy_id?: string;
  document?: string;
  section_title?: string;
  snippet?: string;
  content?: string;
  citation?: string;
  category?: string;
  relevance_score?: number;
}

export interface JevEvaluation {
  confidence_score: number;
  recommended_decision?: "APPROVE" | "ESCALATE_TO_HUMAN" | "REJECT" | string;
  risk_score?: number;
  risk_level?: string;
  decision_justification?: string;
  rationale?: string;
  human_review_required?: boolean;
  evidence_sufficient?: boolean;
  supplier_recommendation_supported?: boolean;
  probability_distribution?: {
    approve_direct?: number;
    human_review?: number;
  };
  is_fallback?: boolean;
  latency_ms?: number;
  model_version?: string;
}

export interface RuleEvaluation {
  is_compliant?: boolean;
  is_authorized?: boolean;
  requires_human_approval: boolean;
  required_approval_role?: string;
  required_role?: string;
  status?: string;
  reasons?: string[];
  hard_block?: boolean;
  block_reason?: string | null;
}

export interface ProposedAction {
  action_type: string;
  action_id?: string;
  request_number?: string;
  approval_id?: string;
  action_summary?: string;
  monetary_value: number;
  currency?: string;
  status: string;
  required_role?: string;
  risk_level?: string;
  reason?: string;
}

export interface ChatMessageResponse {
  run_id: string;
  thread_id: string;
  response: string;
  plan: string[];
  retrieved_evidence: Record<string, any>;
  policy_citations: PolicyCitation[];
  proposed_action?: ProposedAction | null;
  jev_evaluation?: JevEvaluation | null;
  rule_evaluation?: RuleEvaluation | null;
  approval_required: boolean;
  approval_id?: string | null;
  status: string;
}

export interface CascadeBatchImpact {
  batch_id: string;
  batch_number: string;
  product_sku: string;
  product_name: string;
  target_quantity: number;
  current_start_date: string;
  impact: string;
}

export interface CascadeOrderImpact {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  requested_date: string;
  total_amount: number;
  impact: string;
}

export interface CascadeSupplierOption {
  supplier_id: string;
  supplier_code: string;
  supplier_name: string;
  unit_price: number;
  lead_time_days: number;
  can_meet_deadline: boolean;
  estimated_arrival_date: string;
  reliability_score: number;
  is_approved: boolean;
  composite_score: number;
  total_cost: number;
  recommendation_reason: string;
}

export interface CascadeReport {
  delay_code: string;
  supplier_name: string;
  material_code: string;
  delay_days: number;
  affected_batches: CascadeBatchImpact[];
  affected_orders: CascadeOrderImpact[];
  alternative_suppliers: CascadeSupplierOption[];
  recommended_supplier?: CascadeSupplierOption;
  reschedule_plan?: {
    batch_number: string;
    current_start_date: string;
    proposed_start_date: string;
    status: string;
    rationale: string;
  };
  customer_communication_draft?: {
    recipient: string;
    subject: string;
    body: string;
    is_simulated: boolean;
  };
  approval_required: boolean;
  approval_role: RoleType;
  estimated_cost: number;
}

export interface AgentRunStep {
  step_number: number;
  description: string;
  duration_ms: number;
  status: string;
}

export interface AgentRunItem {
  id: string;
  thread_id?: string;
  goal: string;
  status: string;
  user_role: string;
  created_at: string;
  completed_at?: string | null;
  steps?: AgentRunStep[];
  actions_proposed?: any[];
  approvals?: any[];
}

export interface AuditItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
  details: Record<string, any>;
  approval_id?: string | null;
  agent_run_id?: string | null;
}
