import { Transaction, StrategyType, PolicyCheckResult } from '../../types';

export class RedTeamAgent {
  /**
   * Challenges proposed recovery decisions to prevent bad actions.
   */
  public static validate(transaction: Transaction, proposedStrategy: StrategyType): {
    approved: boolean;
    counterArgument?: string;
    suggestedAlternative?: StrategyType;
  } {
    // Challenge 1: Retrying when bank failure rate is high
    if (proposedStrategy === 'RETRY' && transaction.bankCode === 'BANK_XYZ') {
      return {
        approved: false,
        counterArgument: 'Bank XYZ is experiencing core gateway degradation (>4.2s latency). Immediate gateway retry will fail.',
        suggestedAlternative: 'PAYMENT_LINK'
      };
    }

    // Challenge 2: Retrying when retryCount >= 2
    if (proposedStrategy === 'RETRY' && transaction.retryCount >= 2) {
      return {
        approved: false,
        counterArgument: `Transaction has already failed ${transaction.retryCount} retry attempts. Further retries will annoy customer and increase decline rate.`,
        suggestedAlternative: 'PAYMENT_LINK'
      };
    }

    return { approved: true };
  }
}

export class FinancialGuardian {
  public static readonly MAX_AUTONOMOUS_AMOUNT = 10000; // ₹10,000
  public static readonly MAX_RETRIES = 2;
  public static readonly MAX_CONTACTS = 2;

  /**
   * Validates merchant policy rules before execution.
   */
  public static evaluatePolicy(transaction: Transaction, strategy: StrategyType): PolicyCheckResult {
    const amount = transaction.amount;
    const retries = transaction.retryCount;
    const contacts = transaction.customerContactsCount;

    // Rule 1: Already recovered check
    if (transaction.status === 'RECOVERED') {
      return {
        status: 'BLOCKED',
        ruleName: 'ALREADY_RECOVERED',
        rationale: 'Transaction has already been successfully recovered.',
        autonomousLimit: this.MAX_AUTONOMOUS_AMOUNT,
        currentRetries: retries,
        currentContacts: contacts,
        transactionAmount: amount
      };
    }

    // Rule 2: Maximum Retry Count Check
    if (strategy === 'RETRY' && retries >= this.MAX_RETRIES) {
      return {
        status: 'BLOCKED',
        ruleName: 'MAX_RETRIES_EXCEEDED',
        rationale: `Maximum retry limit of ${this.MAX_RETRIES} attempts reached for this transaction (${retries}/${this.MAX_RETRIES}). Escalating to manual review.`,
        autonomousLimit: this.MAX_AUTONOMOUS_AMOUNT,
        currentRetries: retries,
        currentContacts: contacts,
        transactionAmount: amount
      };
    }

    // Rule 3: Customer Contact Frequency Cap
    if ((strategy === 'PAYMENT_LINK' || strategy === 'REMINDER') && contacts >= this.MAX_CONTACTS) {
      return {
        status: 'BLOCKED',
        ruleName: 'MAX_CONTACTS_EXCEEDED',
        rationale: `Customer contact frequency limit of ${this.MAX_CONTACTS} contacts per 24h reached (${contacts}/${this.MAX_CONTACTS}).`,
        autonomousLimit: this.MAX_AUTONOMOUS_AMOUNT,
        currentRetries: retries,
        currentContacts: contacts,
        transactionAmount: amount
      };
    }

    // Rule 4: High Value Autonomous Threshold
    if (amount > this.MAX_AUTONOMOUS_AMOUNT) {
      return {
        status: 'REQUIRES_HUMAN_APPROVAL',
        ruleName: 'HIGH_VALUE_THRESHOLD',
        rationale: `Transaction amount (₹${amount.toLocaleString('en-IN')}) exceeds autonomous threshold (₹${this.MAX_AUTONOMOUS_AMOUNT.toLocaleString('en-IN')}). High-value financial action requires merchant sign-off.`,
        autonomousLimit: this.MAX_AUTONOMOUS_AMOUNT,
        currentRetries: retries,
        currentContacts: contacts,
        transactionAmount: amount
      };
    }

    return {
      status: 'APPROVED',
      ruleName: 'MERCHANT_POLICY_PASSED',
      rationale: 'Action complies with all financial, retry, and contact frequency policies.',
      autonomousLimit: this.MAX_AUTONOMOUS_AMOUNT,
      currentRetries: retries,
      currentContacts: contacts,
      transactionAmount: amount
    };
  }
}
