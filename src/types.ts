// types.ts
export type Permission = {
  createProject?: boolean;
  approveRequests?: boolean;
  viewFinance?: boolean;
  createUsers?: boolean;
  manageRoles?: boolean;
  viewAllProjects?: boolean;
  approveBOQ?: boolean;
  approvePayments?: boolean;
  viewAllReports?: boolean;
  systemSettings?: boolean;
  submitBOQ?: boolean;
  uploadBOQ?: boolean;
  submitWageRequest?: boolean;
  manageMaterials?: boolean;
  createPurchaseOrder?: boolean;
  updatePrices?: boolean;
  viewInventory?: boolean;
  issueItems?: boolean;
  receiveItems?: boolean;
  inspectMaterials?: boolean;
  certifyMilestones?: boolean;
  submitMaterialRequest?: boolean;
  submitSiteProgress?: boolean;
  assignTasks?: boolean;
  viewOwnTasks?: boolean;
  viewAuditLog?: boolean;
  manageBudget?: boolean;
  raiseFinanceRequest?: boolean;
  viewProjects?: boolean;
  updateSiteProgress?: boolean;
  uploadSiteMedia?: boolean;
  viewProjectHistory?: boolean;
  addQCComments?: boolean;
  viewSiteModule?: boolean;
  generateStoreReport?: boolean;
  everything?: boolean;
  canDeleteProject?: boolean;
  canEditProject?: boolean;
  canRequestFund?: boolean;
  createMillestone?:boolean;
  canrequestMalterial?:boolean;canmakesiteupdate?:boolean;
};
// types.ts - Add these types
export type ContractorMaterialRequest = {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  additionalNote: string;
};

export type ContractorMilestone = {
  id: string;
  title: string;
  targetDate: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: string;
};

export type Contractor = {
  id: string;
  projectId: string;
  name: string;
  companyName: string;
  description: string;
  startDate: string;
  completionDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedSupervisors: { id: string; name: string }[];
  agreedCost: number;
  materialRequests: ContractorMaterialRequest[];
  milestones: ContractorMilestone[];
  status: 'active' | 'cancelled';
  attachments: { name: string; url: string; type: string }[];
  notes: string;
  createdBy: string;
  createdById: string;
  createdAt: string;
  cancelledAt?: string;
  cancelledReason?: string;
  excelData?: any[];
};
export type Role = {
  id: string;
  label: string;
  name: string;
  color: string;
  pages: string[];
  permissions: Permission;
};

export type User = {
  phone: string;
  id: string;
  name: string;
  email: string;
  roleId: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  siteAddress: string;
  startDate: string;
  deadline: string;
  progress: number;
  status: 'on-track' | 'active' | 'attention' | 'delayed' | 'completed';
  boqStatus: 'approved' | 'missing' | 'pending' | 'uploaded';
  contractValue: number;
  expenditure: number;
  projectCode: string;
  qsAssignedId?: string;
  qsAssignedName?: string;
  createdAt: string;
  updatedAt: string;
};

export type BOQItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

// export type BOQ = {
//   id: string;
//   projectId: string;
//   type: 'approved' | 'budgeted';
//   version: string;
//   items: BOQItem[];
//   totalAmount: number;
//   uploadedBy: string;
//   uploadedById: string;
//   date: string;
//   status: 'approved' | 'pending' | 'draft';
//   attachments: { name: string; url: string; type: string }[];
//   notes?: string;
//   approvedBy?: string;
//   approvedAt?: string;
// };
export type BOQ = {
  id: string;
  projectId: string;
  type: 'approved' | 'budgeted';
  version: string;
  items: BOQItem[];
  totalAmount: number;
  uploadedBy: string;
  uploadedById: string;
  date: string;
  status: 'approved' | 'pending' | 'draft' | 'rejected';
  attachments: { name: string; url: string; type: string }[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: BOQComment[];
};
export type ProjectMilestone = {
  id: string;
  projectId: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  qcCertified: boolean;
  qcCertifiedBy?: string;
  qcCertifiedAt?: string;
  description?: string;
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  projectId?: string;
  details?: string;
};

// types.ts - Add SiteUpdate type
export type SiteUpdate = {
  id: string;
  projectId: string;
  date: string;
  activityPercentage: number;
  taskStatus: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  taskName: string;
  isGeneral: boolean;
  description: string;
  submittedBy: string;
  submittedById: string;
  createdAt: string;
  updatedAt?: string;
  attachments: { name: string; url: string; type: string }[];
  status: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledReason?: string;
};
// types.ts - Add BOQComment type
export type BOQComment = {
  updatedAt: string;
  id: string;
  boqId: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
  attachments?: { name: string; url: string; type: string }[];
};
// export type MaterialRequest = {
//   id: string;
//   projectId: string;
//   materials: { name: string; quantity: number; unit: string }[];
//   description: string;
//   requestedBy: string;
//   requestedById: string;
//   date: string;
//   qsApproval: 'pending' | 'approved' | 'rejected';
//   scApproval: 'pending' | 'approved' | 'rejected';
//   hodApproval: 'pending' | 'approved' | 'rejected';
//   storeStatus: 'pending' | 'issued' | 'waiting' | 'partial';
//   priority: 'normal' | 'urgent' | 'critical';
// };
// types.ts - Add or update Task type
export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  notes: string;
  startDateTime: string;
  endDateTime: string;
  assignedTo: { id: string; name: string }[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  attachments: { name: string; url: string; type: string }[];
  createdBy: string;
  createdById: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
};
// export type Task = {
//   id: string;
//   title: string;
//   description: string;
//   projectId: string;
//   assignedTo: string;
//   assignedToId: string;
//   assignedBy: string;
//   assignedById: string;
//   dueDate: string;
//   status: 'pending' | 'in-progress' | 'completed' | 'overdue';
//   priority: 'low' | 'medium' | 'high' | 'critical';
//   createdAt: string;
//   completedAt?: string;
// };
// types.ts - Add or update MaterialRequest type
export type MaterialRequest = {
  id: string;
  projectId: string;
  items: {
    id: string;
    materialName: string;
    quantity: number;
    unit: string;
    taskRelated: string;
  }[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: "pending" | "qs_approved" | "supply_chain_approved" | "store_issued" | "cancelled" | "rejected";
  requestedBy: { id: string; name: string }[];
  attachments: { name: string; url: string; type: string }[];
  notes: string;
  createdAt: string;
  qsApprovedAt?: string;
  qsApprovedBy?: string;
  supplyChainApprovedAt?: string;
  supplyChainApprovedBy?: string;
  storeIssuedAt?: string;
  storeIssuedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  cancelledAt?: string;
  cancelledReason?: string;
};
export type QCTask = {
  id: string;
  type: 'material' | 'milestone';
  projectId: string;
  projectName: string;
  itemName: string;
  quantity?: string;
  status: 'pending' | 'certified' | 'failed' | 'rejected';
  inspector: string;
  inspectorId: string;
  date: string;
  notes?: string;
  result?: 'pass' | 'fail' | 'conditional';
};
// types.ts - Add or update FundRequest type
export type FundRequest = {
  id: string;
  projectId: string;
  purpose: string;
  amount: number;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedById: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'mdapproval' | 'rejected' | 'review';
  attachments: { name: string; url: string; type: string }[];
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
};
// types.ts - Add Supply Chain types

export type Material = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  threshold: number;
  category: string;
  lastUpdated: string;
  lastUpdatedBy?: string;
  siteAllocated?: string;
};

export type PriceHistory = {
  id: string;
  materialId: string;
  oldPrice: number;
  newPrice: number;
  percentageChange: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
};

export type Vendor = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  materialsSupplied: string[];
  rating: number;
  status: 'active' | 'inactive';
  createdAt: string;
  priceQuotes: PriceQuote[];
};

export type PriceQuote = {
  id: string;
  vendorId: string;
  materialId: string;
  quotedPrice: number;
  quotedDate: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  vendorIds: string;
  vendorName: string;
  items: { materialId: string; materialName: string; quantity: number; unitPrice: number; totalPrice: number }[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'received' | 'partial' | 'cancelled';
  createdAt: string;
  createdBy: string;
  expectedDelivery: string;
  waybillNumber?: string;
  waybillStatus: 'pending' | 'matched' | 'mismatch';
  financeRequestId?: string;
  fundRequestStatus?: 'pending' | 'approved' | 'rejected';
};

export type Delivery = {
  id: string;
  poNumber: string;
  vendorName: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  site: string;
  projectId: string;
  projectName: string;
  deliveryAddress: string;
  expectedDeliveryTime: string;
  actualDeliveryTime?: string;
  items: { materialName: string; quantity: number; unit: string }[];
  status: 'assigned' | 'in-transit' | 'delivered' | 'signed-off' | 'cancelled';
  goodsReceiptNote?: {
    id: string;
    receivedBy: string;
    receivedAt: string;
    signedByEngineer: string;
    engineerName: string;
    signatureDate: string;
    notes: string;
    discrepancies?: string;
  };
};

export type MaterialRequestComparison = {
  materialRequestId: string;
  materialName: string;
  requestedQuantity: number;
  availableStock: number;
  shortfall: number;
  status: 'sufficient' | 'insufficient' | 'partial';
  suggestedPO: boolean;
};

export type StoreTransaction = {
  id: string;
  type: 'issue' | 'return' | 'adjustment' | 'receive';
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  projectId?: string;
  requestedBy?: string;
  issuedTo?: string;
  reason?: string;
  date: string;
  referenceNumber: string;
};
// types.ts - Add these types
type ProcurementItemStatus = {
  materialId: string;
  materialName: string;
  boqQuantity: number;
  availableStock: number;
  status: 'available' | 'not_available' | 'limited_available';
  shortfall: number;
  notes?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export type ProjectProcurementStatus = {
  projectId: string;
  projectName: string;
  budgetedBOQId: string;
  items: ProcurementItemStatus[];
  overallStatus: 'ready' | 'partial' | 'pending';
  lastUpdated: string;
};
