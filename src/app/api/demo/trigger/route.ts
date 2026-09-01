import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { db } from '@/lib/db/store';
import { FutureSimulator } from '@/lib/engine/simulator';
import { FinancialGuardian } from '@/lib/engine/judge';
import { ExecutionEngine, OutcomeObserver } from '@/lib/engine/executor';
import { RecoveryDecision } from '@/types';

export async function POST(request: NextRequest) {
  ensureDatabaseInitialized();
  try {
    const body = await request.json();
    const scenario = body.scenario || 'SCENARIO_1';

    if (scenario === 'SCENARIO_1') {
      // Scenario 1: Payment Degradation Event (TXN_92817 ₹9,999)
      const txn = db.transactions.get('TXN_92817') || Array.from(db.transactions.values())[0];
      const customer = db.customerProfiles.get(txn.customerId);

      const simulation = FutureSimulator.simulate(txn, customer);
      const policy = FinancialGuardian.evaluatePolicy(txn, 'SMART_RECOVERY');

      const decisionId = 'REC_10482';
      const decision: RecoveryDecision = {
        id: decisionId,
        decisionId,
        transactionId: txn.id,
        customerId: txn.customerId,
        amount: txn.amount,
        riskScore: 92,
        diagnosis: 'Payment-method degradation (Bank XYZ UPI API latency > 4.2s)',
        strategy: 'SMART_RECOVERY',
        expectedRecovery: 9999,
        policyCheck: policy,
        executionStatus: 'SUCCESS',
        razorpayPaymentLinkId: 'pl_L92817',
        razorpayPaymentLinkUrl: 'https://razorpay.com/pay/pl_L92817',
        actualRecovery: 9999,
        predictionError: 0,
        createdAt: new Date().toISOString(),
        executedAt: new Date().toISOString()
      };

      db.decisions.set(decisionId, decision);

      // Trigger Webhook Observation
      OutcomeObserver.handleWebhook({
        event: 'payment_link.paid',
        payload: {
          payment_link: {
            entity: {
              id: 'pl_L92817',
              amount: txn.amount * 100,
              notes: { transaction_id: txn.id }
            }
          }
        }
      });

      return NextResponse.json({
        scenario,
        title: 'Payment Degradation Event — Smart Recovery Success',
        revenueAtRisk: 1024000,
        affectedTransactions: 413,
        decision,
        simulation,
        policy,
        actualRecovered: 9999
      });
    } else {
      // Scenario 2: Graceful Failure Demo (TXN_92814 Max Retries Exceeded)
      const txn = db.transactions.get('TXN_92814') || Array.from(db.transactions.values())[3];
      txn.retryCount = 2; // ensure retries = 2

      const policy = FinancialGuardian.evaluatePolicy(txn, 'RETRY');

      const decisionId = 'REC_10481';
      const decision: RecoveryDecision = {
        id: decisionId,
        decisionId,
        transactionId: txn.id,
        customerId: txn.customerId,
        amount: txn.amount,
        riskScore: 65,
        diagnosis: 'Payment Timeout — Retry cap reached',
        strategy: 'RETRY',
        expectedRecovery: 0,
        policyCheck: policy,
        executionStatus: 'BLOCKED',
        createdAt: new Date().toISOString()
      };

      db.decisions.set(decisionId, decision);
      db.auditLogs.unshift({
        id: `AUDIT_${Date.now()}`,
        decisionId,
        transactionId: txn.id,
        timestamp: new Date().toISOString(),
        eventType: 'POLICY_BLOCKED',
        actor: 'FINANCIAL_GUARDIAN',
        details: policy.rationale,
        payload: { policyCheck: policy, transactionId: txn.id }
      });

      return NextResponse.json({
        scenario,
        title: 'Graceful Failure Demo — Max Retry Policy Blocked',
        transaction: txn,
        decision,
        policy
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
