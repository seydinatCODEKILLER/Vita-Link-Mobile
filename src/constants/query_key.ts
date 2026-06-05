export const QUERY_KEYS = {
  // Auth
  me: ["me"],

  // Alerts (Agent)
  alerts: ["alerts"],
  myAlerts: ["alerts", "my-structure"],
  alert: (id: string) => ["alerts", id],
  alertResponses: (id: string) => ["alerts", id, "responses"],

  // Donations (Agent - Scan)
  structureDonations: ["donations", "structure"],
  donation: (id: string) => ["donations", id],

  // Donation Days (Journées de don - Agent)
  donationDays: ["donation-days"],
  myStructureDays: (filters?: object) => [
    "donation-days",
    "my-structure",
    filters,
  ],
  donationDay: (id: string) => ["donation-days", id],
  dayRegistrations: (id: string) => ["donation-days", id, "registrations"],

  // Blood Stocks (Agent)
  bloodStocks: ["blood-stocks", "me"],

  // Health Structures (Agent)
  myStructure: ["health-structures", "me"],
  myStructureStaff: ["health-structures", "me", "staff"],
  myStructureStats: ["health-structures", "me", "stats"],
  structureStats: ["structure", "stats"],

  // Dashboards (CNTS & Hôpital)
  cntsDashboard: (limit?: number) => ["dashboard", "cnts", limit],
  hospitalDashboard: (limit?: number) => ["dashboard", "hospital", limit],

  // Blood Requests (Demandes de sang hôpitaux)
  bloodRequests: (filters?: object) => ["blood-requests", filters],
  bloodRequest: (id: string) => ["blood-requests", id],

  // Purchase Orders (Bons de commande)
  purchaseOrders: (filters?: object) => ["purchase-orders", filters],
  purchaseOrder: (id: string) => ["purchase-orders", id],

  // Notifications
  myNotifications: ["notifications", "me"],
} as const;
