import { 
  Transaction, 
  CustomerProfile, 
  RiskEvent, 
  SimulationResult, 
  RecoveryDecision, 
  AuditLog, 
  PaymentMethod, 
  FailureReason 
} from '../../types';

export function generateSeedDataset() {
  const customerProfiles: CustomerProfile[] = [];
  const transactions: Transaction[] = [];
  const riskEvents: RiskEvent[] = [];
  const simulations: SimulationResult[] = [];
  const decisions: RecoveryDecision[] = [];
  const auditLogs: AuditLog[] = [];

  const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Kabir', 'Sneha', 'Aditya', 'Isha', 'Rahul', 'Kavya', 'Siddharth', 'Meera', 'Arjun', 'Tanvi'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Singh', 'Chopra', 'Deshmukh', 'Joshi', 'Mehta', 'Kulkarni', 'Roy', 'Rao', 'Das'];
  const banks = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'BANK_XYZ', 'KOTAK'];
  const paymentMethods: PaymentMethod[] = ['UPI', 'CARD', 'NETBANKING', 'WALLET', 'PAYLATER'];

  // 1. Generate 1,000 Customer Profiles
  for (let i = 1; i <= 1000; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const preferredMethod = paymentMethods[i % paymentMethods.length];
    const ltv = Math.round(5000 + (i * 1420) % 245000);
    const id = `CUST_${10000 + i}`;

    customerProfiles.push({
      id,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      phone: `+91 98765 ${10000 + i}`,
      ltv,
      successCount: 5 + (i % 20),
      failureCount: i % 4,
      preferredMethod,
      bestContactWindow: i % 2 === 0 ? '20:00 - 22:00' : '14:00 - 16:00',
      recoveryResponseRates: {
        PAYMENT_LINK: 0.75 + (i % 15) / 100,
        REMINDER: 0.58 + (i % 20) / 100,
        RETRY: 0.32 + (i % 10) / 100,
        ALTERNATE_METHOD: 0.65 + (i % 12) / 100
      },
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString()
    });
  }

  // 2. Explicit Demo Transactions (From UI Spec & Screenshot)
  const keyDemoTransactions: Partial<Transaction>[] = [
    {
      id: 'TXN_92817',
      customerId: 'CUST_12981',
      customerName: 'Aarav Sharma',
      amount: 9999,
      status: 'RECOVERED',
      paymentMethod: 'UPI',
      failureReason: 'PAYMENT_METHOD_DEGRADATION',
      bankCode: 'BANK_XYZ',
      retryCount: 1,
      customerContactsCount: 1
    },
    {
      id: 'TXN_92816',
      customerId: 'CUST_68211',
      customerName: 'Ananya Verma',
      amount: 4599,
      status: 'FAILED',
      paymentMethod: 'CARD',
      failureReason: 'BANK_DECLINE',
      bankCode: 'ICICI',
      retryCount: 1,
      customerContactsCount: 1
    },
    {
      id: 'TXN_92815',
      customerId: 'CUST_77521',
      customerName: 'Rohan Patel',
      amount: 14999,
      status: 'FAILED',
      paymentMethod: 'UPI',
      failureReason: 'CHECKOUT_ABANDONMENT',
      bankCode: 'BANK_XYZ',
      retryCount: 0,
      customerContactsCount: 0
    },
    {
      id: 'TXN_92814',
      customerId: 'CUST_44219',
      customerName: 'Priya Reddy',
      amount: 2199,
      status: 'FAILED',
      paymentMethod: 'NETBANKING',
      failureReason: 'PAYMENT_TIMEOUT',
      bankCode: 'SBI',
      retryCount: 2, // Max retry reached! For failure demo
      customerContactsCount: 2
    },
    {
      id: 'TXN_92813',
      customerId: 'CUST_11871',
      customerName: 'Vikram Nair',
      amount: 7499,
      status: 'FAILED',
      paymentMethod: 'NETBANKING',
      failureReason: 'NETWORK_ERROR',
      bankCode: 'AXIS',
      retryCount: 0,
      customerContactsCount: 1
    }
  ];

  // Ingest Key Demo Transactions
  keyDemoTransactions.forEach((t, idx) => {
    const fullTxn: Transaction = {
      id: t.id!,
      customerId: t.customerId!,
      customerName: t.customerName,
      amount: t.amount!,
      currency: 'INR',
      status: t.status as any,
      paymentMethod: t.paymentMethod!,
      failureReason: t.failureReason as FailureReason,
      bankCode: t.bankCode,
      retryCount: t.retryCount || 0,
      customerContactsCount: t.customerContactsCount || 0,
      createdAt: new Date(Date.now() - (idx * 60000)).toISOString(),
      updatedAt: new Date(Date.now() - (idx * 30000)).toISOString()
    };
    transactions.push(fullTxn);

    // Create matching risk event
    const riskScore = t.id === 'TXN_92817' ? 92 : t.id === 'TXN_92815' ? 95 : t.id === 'TXN_92816' ? 78 : t.id === 'TXN_92814' ? 65 : 81;
    riskEvents.push({
      id: `RISK_${t.id}`,
      transactionId: t.id!,
      riskScore,
      revenueAtRisk: t.amount!,
      issueType: `${t.paymentMethod} Failure - ${t.bankCode}`,
      causeCategory: t.failureReason as FailureReason,
      affectedCohortSize: t.bankCode === 'BANK_XYZ' ? 413 : 124,
      createdAt: fullTxn.createdAt
    });
  });

  // 3. Generate remaining 10,000 Transactions to fill dataset
  const baseCount = 10000;
  for (let i = 1; i <= baseCount; i++) {
    const txnId = `TXN_${10000 + i}`;
    const cust = customerProfiles[i % customerProfiles.length];
    const amountChoices = [499, 999, 1499, 2999, 4999, 8999, 14999, 24999, 49999];
    const amount = amountChoices[i % amountChoices.length];
    
    // Determine status & failure distributions
    let status: Transaction['status'] = 'SUCCESS';
    let failureReason: FailureReason | undefined = undefined;
    let bankCode = banks[i % banks.length];
    let method = paymentMethods[i % paymentMethods.length];

    if (i % 7 === 0) {
      status = 'FAILED';
      failureReason = i % 3 === 0 ? 'PAYMENT_METHOD_DEGRADATION' : i % 2 === 0 ? 'BANK_DECLINE' : 'PAYMENT_TIMEOUT';
      if (failureReason === 'PAYMENT_METHOD_DEGRADATION') bankCode = 'BANK_XYZ';
    } else if (i % 13 === 0) {
      status = 'ABANDONED';
      failureReason = 'CHECKOUT_ABANDONMENT';
    } else if (i % 19 === 0) {
      status = 'RECOVERED';
      failureReason = 'BANK_DECLINE';
    }

    const createdTime = new Date(Date.now() - (i * 180000)).toISOString();
    transactions.push({
      id: txnId,
      customerId: cust.id,
      customerName: cust.name,
      amount,
      currency: 'INR',
      status,
      paymentMethod: method,
      failureReason,
      bankCode,
      retryCount: status === 'FAILED' ? (i % 3) : 0,
      customerContactsCount: status === 'FAILED' ? (i % 2) : 0,
      createdAt: createdTime,
      updatedAt: createdTime
    });

    if (status === 'FAILED' || status === 'ABANDONED') {
      const riskScore = 60 + (i % 38);
      riskEvents.push({
        id: `RISK_${txnId}`,
        transactionId: txnId,
        riskScore,
        revenueAtRisk: amount,
        issueType: `${method} Failure - ${bankCode}`,
        causeCategory: failureReason || 'BANK_DECLINE',
        affectedCohortSize: bankCode === 'BANK_XYZ' ? 413 : 85,
        createdAt: createdTime
      });
    }
  }

  // 4. Seed Audit Logs for Demo
  auditLogs.push(
    {
      id: 'AUDIT_01',
      decisionId: 'REC_10482',
      transactionId: 'TXN_92817',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      eventType: 'RECOVERY_EXECUTED',
      actor: 'RAZORPAY_EXECUTOR',
      details: 'Payment Link Created via Razorpay TEST MODE: https://razorpay.com/pay/pl_L92817',
      payload: { payment_link_id: 'pl_L92817', amount: 9999, status: 'created' }
    },
    {
      id: 'AUDIT_02',
      decisionId: 'REC_10481',
      transactionId: 'TXN_92814',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      eventType: 'POLICY_BLOCKED',
      actor: 'FINANCIAL_GUARDIAN',
      details: 'BLOCKED: Transaction TXN_92814 has reached maximum retry limit (2/2). Mandatory escalation required.',
      payload: { rule: 'MAX_RETRIES', current_retries: 2, max_allowed: 2 }
    }
  );

  return {
    customerProfiles,
    transactions,
    riskEvents,
    simulations,
    decisions,
    auditLogs
  };
}
