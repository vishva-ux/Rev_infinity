export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'EMI' | 'PAYLATER';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'ABANDONED' | 'RECOVERED' | 'EXPIRED';
export type FailureReason = 
  | 'BANK_DECLINE' 
  | 'PAYMENT_TIMEOUT' 
  | 'PAYMENT_METHOD_DEGRADATION' 
  | 'CHECKOUT_ABANDONMENT' 
  | 'REPEATED_FAILURES' 
  | 'SUBSCRIPTION_EXPIRED' 
  | 'NETWORK_ERROR' 
  | 'INSUFFICIENT_FUNDS';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  ltv: number;
  successCount: number;
  failureCount: number;
  preferredMethod: PaymentMethod;
  bestContactWindow: string; // e.g. "20:00 - 22:00"
  recoveryResponseRates: Record<string, number>; // e.g. { PAYMENT_LINK: 0.79, REMINDER: 0.61 }
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName?: string;
  amount: number; // in INR
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  failureReason?: FailureReason;
  bankCode?: string;
  retryCount: number;
  customerContactsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RiskEvent {
  id: string;
  transactionId: string;
  riskScore: number; // 0 - 100
  revenueAtRisk: number;
  issueType: string;
  causeCategory: FailureReason;
  affectedCohortSize?: number;
  createdAt: string;
}

export type StrategyType = 
  | 'DO_NOTHING' 
  | 'RETRY' 
  | 'PAYMENT_LINK' 
  | 'REMINDER' 
  | 'ALTERNATE_METHOD' 
  | 'SMART_RECOVERY' 
  | 'AGGRESSIVE_RECOVERY';

export interface SimulationScenario {
  strategy: StrategyType;
  name: string;
  description: string;
  expectedRecovery: number;
  confidence: number; // 0 - 1.0 (e.g. 0.72)
  interventionCost: number;
  customerFriction: 'Low' | 'Medium' | 'High';
  riskPenalty: number;
  netImpact: number;
  isRecommended?: boolean;
}

export interface SimulationResult {
  id: string;
  transactionId: string;
  baselineAmount: number;
  scenarios: SimulationScenario[];
  recommendedStrategy: StrategyType;
  expectedNetRecovery: number;
  confidence: number;
  rationale: string;
  createdAt: string;
}

export type PolicyStatus = 'APPROVED' | 'BLOCKED' | 'REQUIRES_HUMAN_APPROVAL';

export interface PolicyCheckResult {
  status: PolicyStatus;
  ruleName: string;
  rationale: string;
  autonomousLimit: number;
  currentRetries: number;
  currentContacts: number;
  transactionAmount: number;
}

export type ExecutionStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'BLOCKED';

export interface RecoveryDecision {
  id: string;
  decisionId: string;
  transactionId: string;
  customerId: string;
  amount: number;
  riskScore: number;
  diagnosis: string;
  strategy: StrategyType;
  expectedRecovery: number;
  policyCheck: PolicyCheckResult;
  executionStatus: ExecutionStatus;
  razorpayPaymentLinkId?: string;
  razorpayPaymentLinkUrl?: string;
  actualRecovery?: number;
  predictionError?: number;
  createdAt: string;
  executedAt?: string;
}

export interface AuditLog {
  id: string;
  decisionId: string;
  transactionId: string;
  timestamp: string;
  eventType: string;
  actor: string; // e.g. "REVENUE_DETECTOR", "POLICY_GUARDIAN", "RAZORPAY_EXECUTOR"
  details: string;
  payload: Record<string, unknown>;
}

export interface DashboardSummary {
  revenueAtRisk: number;
  recoverableRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
  interventionsCount: number;
  riskTrend: number;
  recoverableTrend: number;
  recoveredTrend: number;
  recoveryRateTrend: number;
  interventionsTrend: number;
  transactionsAnalyzed: number;
  highRiskCustomersCount: number;
  paymentFailuresCount: number;
  abandonedCheckoutsCount: number;
  subscriptionFailuresCount: number;
}
