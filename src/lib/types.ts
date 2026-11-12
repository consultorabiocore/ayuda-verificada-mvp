export type Role = "applicant" | "donor" | "company_donor" | "reviewer" | "admin" | "superadmin";

export type RequestCategory =
  | "health"
  | "education"
  | "business"
  | "utilities"
  | "housing";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "documentation_required"
  | "verification_in_progress"
  | "verified"
  | "approved"
  | "published"
  | "partially_funded"
  | "fully_funded"
  | "payment_pending"
  | "payment_processing"
  | "paid"
  | "closed"
  | "rejected"
  | "suspended"
  | "cancelled"
  | "refund_processing"
  | "refunded";

export type Urgency = "emergency" | "high" | "medium" | "normal";

export type VerificationScore = {
  identity: number; // 0-20
  need: number; // 0-25
  vulnerability: number; // 0-20
  urgency: number; // 0-15
  destination: number; // 0-20
};

export type DocumentCategory =
  | "identity"
  | "health"
  | "housing"
  | "education"
  | "business"
  | "payment";

export type StoredDocument = {
  id: string;
  ownerId: string;
  requestId?: string;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  size: number;
  bucket: string;
  path: string;
  createdAt: string;
  isPrivate: true;
};

export type Provider = {
  id: string;
  name: string;
  type: "pharmacy" | "clinic" | "school" | "supplier" | "landlord" | "utility" | "other";
  verified: boolean;
  region?: string;
};

export type HelpRequest = {
  id: string;
  applicantId: string;
  applicantDisplayName: string;
  category: RequestCategory;
  subcategory: string;
  title: string;
  description: string;
  amountRequested: number; // CLP
  amountCommitted: number; // aportes comprometidos
  amountReceived: number; // recibido y confirmado
  amountPaid: number; // pagado al acreedor (deuda)
  urgency: Urgency;
  region: string;
  commune?: string;
  status: RequestStatus;
  providerId?: string;
  paymentDetailsAuthorized: boolean;
  paymentDetails?: {
    bank: string;
    accountType: string;
    accountNumber: string;
    holder: string;
  };
  verificationScore?: VerificationScore;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  documents: string[]; // document ids
  milestones: string[];
  notes?: string;
};

export type Donation = {
  id: string;
  donorId: string;
  donorDisplayName: string;
  requestId: string;
  amount: number;
  anonymousPublic: boolean;
  status: "committed" | "transfer_reported" | "received_confirmed" | "paid" | "cancelled" | "disputed";
  createdAt: string;
  transactionId: string;
};

export type PaymentTransaction = {
  id: string;
  donationId?: string;
  requestId?: string;
  provider: "simulated" | "flow" | "transbank" | "mercadopago";
  externalId: string;
  amount: number;
  currency: "CLP";
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  requestId: string;
  reviewerId: string;
  observations: string;
  recommendation: "approve" | "reject" | "more_info";
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type PlatformUser = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
};

export const CATEGORY_LABELS: Record<RequestCategory, string> = {
  health: "Salud",
  education: "Educación",
  business: "Emprendimientos",
  utilities: "Servicios básicos",
  housing: "Vivienda",
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Borrador",
  submitted: "Recibida",
  under_review: "En revisión",
  documentation_required: "Documentación pendiente",
  verification_in_progress: "Verificación en curso",
  verified: "Verificada",
  approved: "Aprobada",
  published: "Publicada",
  partially_funded: "Financiamiento parcial",
  fully_funded: "Financiada completamente",
  payment_pending: "Pago pendiente",
  payment_processing: "Pago en proceso",
  paid: "Pagada",
  closed: "Cerrada",
  rejected: "Rechazada",
  suspended: "Suspendida",
  cancelled: "Cancelada",
  refund_processing: "Reembolso en proceso",
  refunded: "Reembolsada",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  emergency: "Emergencia",
  high: "Alta",
  medium: "Media",
  normal: "Normal",
};