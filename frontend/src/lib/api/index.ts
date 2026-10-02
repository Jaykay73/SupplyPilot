import { apiClient } from "./client";
import {
  UserProfile,
  LoginResponse,
  DashboardSummary,
  Order,
  OrderRiskAssessment,
  InventoryItem,
  SupplierItem,
  ProductionBatch,
  ProductionLine,
  ApprovalItem,
  ChatMessageResponse,
  CascadeReport,
  AgentRunItem,
  AuditItem,
} from "@/types/api";

export const api = {
  // Auth
  auth: {
    login: async (email: string, password = "demo123"): Promise<LoginResponse> => {
      return apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    getMe: async (): Promise<UserProfile> => {
      return apiClient<UserProfile>("/auth/me");
    },
  },

  // Dashboard
  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      return apiClient<DashboardSummary>("/dashboard/summary");
    },
  },

  // Orders
  orders: {
    list: async (params?: { status?: string; limit?: number; offset?: number }): Promise<Order[]> => {
      const q = new URLSearchParams();
      if (params?.status) q.append("status", params.status);
      if (params?.limit) q.append("limit", params.limit.toString());
      if (params?.offset) q.append("offset", params.offset.toString());
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      return apiClient<Order[]>(`/orders${queryStr}`);
    },
    getById: async (orderId: string): Promise<Order> => {
      return apiClient<Order>(`/orders/${orderId}`);
    },
    getRisk: async (orderId: string): Promise<OrderRiskAssessment> => {
      return apiClient<OrderRiskAssessment>(`/orders/${orderId}/risk`);
    },
    getAtRisk: async (): Promise<any[]> => {
      return apiClient<any[]>("/orders/at-risk");
    },
  },

  // Inventory
  inventory: {
    list: async (type?: "raw_materials" | "finished_goods"): Promise<InventoryItem[]> => {
      const query = type ? `?type=${type}` : "";
      return apiClient<InventoryItem[]>(`/inventory${query}`);
    },
    getProductBySku: async (sku: string): Promise<any> => {
      return apiClient<any>(`/inventory/product/${sku}`);
    },
    getMaterialByCode: async (code: string): Promise<any> => {
      return apiClient<any>(`/inventory/material/${code}`);
    },
  },

  // Suppliers
  suppliers: {
    list: async (): Promise<SupplierItem[]> => {
      return apiClient<SupplierItem[]>("/suppliers");
    },
    getById: async (id: string): Promise<SupplierItem> => {
      return apiClient<SupplierItem>(`/suppliers/${id}`);
    },
    recommend: async (materialCode: string, quantity: number): Promise<any> => {
      return apiClient<any>(`/suppliers/recommend?material_code=${materialCode}&quantity=${quantity}`);
    },
  },

  // Production
  production: {
    listBatches: async (status?: string): Promise<ProductionBatch[]> => {
      const query = status ? `?status=${status}` : "";
      return apiClient<ProductionBatch[]>(`/production/batches${query}`);
    },
    listLines: async (): Promise<ProductionLine[]> => {
      return apiClient<ProductionLine[]>("/production/lines");
    },
    checkCapacity: async (productSku: string, targetDate: string): Promise<any> => {
      return apiClient<any>(`/production/capacity?product_sku=${productSku}&target_date=${targetDate}`);
    },
  },

  // Approvals
  approvals: {
    list: async (statusFilter?: string): Promise<ApprovalItem[]> => {
      const query = statusFilter ? `?status_filter=${statusFilter}` : "";
      return apiClient<ApprovalItem[]>(`/approvals${query}`);
    },
    getById: async (id: string): Promise<ApprovalItem> => {
      return apiClient<ApprovalItem>(`/approvals/${id}`);
    },
    approve: async (id: string): Promise<any> => {
      return apiClient<any>(`/approvals/${id}/approve`, {
        method: "POST",
      });
    },
    reject: async (id: string, reason: string): Promise<any> => {
      return apiClient<any>(`/approvals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
  },

  // Copilot Agent Chat
  chat: {
    sendMessage: async (message: string, threadId?: string): Promise<ChatMessageResponse> => {
      return apiClient<ChatMessageResponse>("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ message, thread_id: threadId }),
      });
    },
  },

  // Domain Events & Flagship Cascade Simulation
  events: {
    list: async (): Promise<any[]> => {
      return apiClient<any[]>("/events");
    },
    simulateDelay: async (): Promise<CascadeReport> => {
      return apiClient<CascadeReport>("/events/simulate-delay", {
        method: "POST",
      });
    },
  },

  // Runs & Telemetry
  runs: {
    list: async (): Promise<AgentRunItem[]> => {
      return apiClient<AgentRunItem[]>("/runs");
    },
    getTrace: async (runId: string): Promise<AgentRunItem> => {
      return apiClient<AgentRunItem>(`/runs/${runId}/trace`);
    },
  },

  // Audit Trail
  audit: {
    list: async (limit = 100): Promise<AuditItem[]> => {
      return apiClient<AuditItem[]>(`/audit?limit=${limit}`);
    },
  },
};

export default api;
