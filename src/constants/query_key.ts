export const QUERY_KEYS = {
  // Auth
  me: ["me"] as const,

  // Alerts (Agent)
  alerts: ["alerts"] as const,
  myAlerts: ["alerts", "my-structure"] as const,
  alert: (id: string) => ["alerts", id] as const,
  alertResponses: (id: string) => ["alerts", id, "responses"] as const,

  // Donations (Agent - Scan)
  structureDonations: ["donations", "structure"] as const,
  donation: (id: string) => ["donations", id] as const,

  // Donation Days (Journées de don - Agent)
  donationDays: ["donation-days"] as const,
  myStructureDaysAll: ["donation-days", "my-structure"] as const,
  myStructureDays: (filters?: object) =>
    ["donation-days", "my-structure", filters] as const,
  donationDay: (id: string) => ["donation-days", id] as const,
  dayRegistrations: (id: string) =>
    ["donation-days", id, "registrations"] as const,

  // Blood Stocks (Agent)
  bloodStocks: ["blood-stocks", "me"] as const,

  // Health Structures (Agent)
  myStructure: ["health-structures", "me"] as const,
  myStructureStaff: ["health-structures", "me", "staff"] as const,
  myStructureStats: ["health-structures", "me", "stats"] as const,
  structureStats: ["structure", "stats"] as const,

  // Dashboards (CNTS & Hôpital)
  // ⚠️ Toujours utiliser la version "All" pour l'invalidation (matching par préfixe),
  // et la version paramétrée uniquement pour le fetch avec des query keys stables.
  cntsDashboardAll: ["dashboard", "cnts"] as const,
  cntsDashboard: (limit?: number) => ["dashboard", "cnts", limit] as const,

  hospitalDashboardAll: ["dashboard", "hospital"] as const,
  hospitalDashboard: (limit?: number) =>
    ["dashboard", "hospital", limit] as const,

  // Blood Requests (Demandes de sang hôpitaux)
  bloodRequestsAll: ["blood-requests"] as const,
  bloodRequests: (filters?: object) => ["blood-requests", filters] as const,
  bloodRequest: (id: string) => ["blood-requests", id] as const,

  // Purchase Orders (Bons de commande)
  purchaseOrdersAll: ["purchase-orders"] as const,
  purchaseOrders: (filters?: object) => ["purchase-orders", filters] as const,
  purchaseOrder: (id: string) => ["purchase-orders", id] as const,

  // Notifications
  myNotifications: ["notifications", "me"] as const,

  // CNTS disponibles (pour affiliation hôpital)
  availableCnts: ["availableCnts"] as const,
} as const;