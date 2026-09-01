import { Transaction, FailureReason, RiskEvent } from '../../types';

export class RevenueDetector {
  /**
   * Calculates a deterministic Risk Score (0 - 100) based on failure history,
   * amount, bank degradation signals, and customer risk factors.
   */
  public static calculateRiskScore(transaction: Transaction): number {
    let score = 50; // Base baseline

    // Factor 1: Transaction Amount
    if (transaction.amount > 50000) score += 20;
    else if (transaction.amount > 10000) score += 12;
    else if (transaction.amount > 2000) score += 5;

    // Factor 2: Payment Method degradation signals
    if (transaction.bankCode === 'BANK_XYZ') score += 25; // Known bank degradation spike
    else if (transaction.paymentMethod === 'UPI' && transaction.failureReason === 'PAYMENT_TIMEOUT') score += 15;

    // Factor 3: Retry History
    if (transaction.retryCount === 1) score += 10;
    else if (transaction.retryCount >= 2) score += 20; // High risk of churn

    // Factor 4: Failure Type
    if (transaction.failureReason === 'CHECKOUT_ABANDONMENT') score += 18;
    else if (transaction.failureReason === 'PAYMENT_METHOD_DEGRADATION') score += 22;
    else if (transaction.failureReason === 'SUBSCRIPTION_EXPIRED') score += 14;

    return Math.min(99, Math.max(10, score));
  }

  public static createRiskEvent(transaction: Transaction): RiskEvent {
    const riskScore = this.calculateRiskScore(transaction);
    const issueType = `${transaction.paymentMethod} Failure - ${transaction.bankCode || 'Generic'}`;

    return {
      id: `RISK_${transaction.id}`,
      transactionId: transaction.id,
      riskScore,
      revenueAtRisk: transaction.amount,
      issueType,
      causeCategory: transaction.failureReason || 'BANK_DECLINE',
      affectedCohortSize: transaction.bankCode === 'BANK_XYZ' ? 413 : 85,
      createdAt: new Date().toISOString()
    };
  }
}

export class RootCauseAnalyzer {
  /**
   * Deterministically diagnoses why revenue is at risk.
   */
  public static diagnose(transaction: Transaction): {
    causeCategory: FailureReason;
    primaryDiagnosis: string;
    contributingFactors: string[];
    technicalDetails: string;
  } {
    const reason = transaction.failureReason || 'BANK_DECLINE';
    let primaryDiagnosis = 'Standard bank transaction decline';
    const contributingFactors: string[] = [];

    if (reason === 'PAYMENT_METHOD_DEGRADATION' || transaction.bankCode === 'BANK_XYZ') {
      primaryDiagnosis = 'Temporary payment gateway & bank-side API degradation';
      contributingFactors.push('Bank XYZ core banking API latency > 4200ms');
      contributingFactors.push('UPI server failure rate spike (+18% in last 2 hours)');
    } else if (reason === 'CHECKOUT_ABANDONMENT') {
      primaryDiagnosis = 'Customer checkout abandonment post-OTP step';
      contributingFactors.push('Session idle timeout exceeded');
      contributingFactors.push('Mobile browser background tab switch');
    } else if (reason === 'PAYMENT_TIMEOUT') {
      primaryDiagnosis = 'Gateway timeout during 2FA authorization';
      contributingFactors.push('SMS OTP delivery delay from Telecom operator');
    } else if (reason === 'BANK_DECLINE') {
      primaryDiagnosis = 'Issuer bank hard decline (Card limit / Security rule)';
      contributingFactors.push('3D Secure authentication rejected');
    } else if (reason === 'SUBSCRIPTION_EXPIRED') {
      primaryDiagnosis = 'Recurring auto-debit card token expired';
      contributingFactors.push('Mandate validity end date reached');
    }

    return {
      causeCategory: reason,
      primaryDiagnosis,
      contributingFactors,
      technicalDetails: `Transaction ${transaction.id} [${transaction.paymentMethod}] Bank: ${transaction.bankCode || 'N/A'}`
    };
  }
}
