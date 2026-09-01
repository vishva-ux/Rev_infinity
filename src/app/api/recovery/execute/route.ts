import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { db } from '@/lib/db/store';
import { RevenueDetector, RootCauseAnalyzer } from '@/lib/engine/detector';
import { FutureSimulator } from '@/lib/engine/simulator';
import { RedTeamAgent, FinancialGuardian } from '@/lib/engine/judge';
import { ExecutionEngine, OutcomeObserver } from '@/lib/engine/executor';
import { RecoveryDecision, StrategyType } from '@/types';

export async function POST(request: NextRequest) {
  ensureDatabaseInitialized();
  try {
    const body = await request.json();
    const transactionId = body.transactionId || 'TXN_92817';
    const requestedStrategy: StrategyType | undefined = body.strategy;

    const transaction = db.transactions.get(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const customer = db.customerProfiles.get(transaction.customerId);

    // 1. DETECT
    const riskEvent = RevenueDetector.createRiskEvent(transaction);

    // 2. DIAGNOSE
    const diagnosis = RootCauseAnalyzer.diagnose(transaction);

    // 3. PREDICT & SIMULATE
    const simulation = FutureSimulator.simulate(transaction, customer);

    // 4. DECIDE
    const selectedStrategy = requestedStrategy || simulation.recommendedStrategy;

    // 5. RED TEAM AGENT
    const redTeam = RedTeamAgent.validate(transaction, selectedStrategy);
    const finalStrategy = redTeam.approved ? selectedStrategy : (redTeam.suggestedAlternative || 'PAYMENT_LINK');

    // 6. POLICY CHECK (Financial Guardian)
    const policyCheck = FinancialGuardian.evaluatePolicy(transaction, finalStrategy);

    const decisionId = `REC_${10000 + Math.floor(Math.random() * 90000)}`;

    const decision: RecoveryDecision = {
      id: decisionId,
      decisionId,
      transactionId: transaction.id,
      customerId: transaction.customerId,
      amount: transaction.amount,
      riskScore: riskEvent.riskScore,
      diagnosis: diagnosis.primaryDiagnosis,
      strategy: finalStrategy,
      expectedRecovery: simulation.expectedNetRecovery,
      policyCheck,
      executionStatus: policyCheck.status === 'APPROVED' ? 'IN_PROGRESS' : 'BLOCKED',
      createdAt: new Date().toISOString()
    };

    db.decisions.set(decisionId, decision);

    // Add Audit Log
    db.auditLogs.unshift({
      id: `AUDIT_${Date.now()}`,
      decisionId,
      transactionId: transaction.id,
      timestamp: new Date().toISOString(),
      eventType: policyCheck.status === 'APPROVED' ? 'POLICY_APPROVED' : 'POLICY_BLOCKED',
      actor: 'FINANCIAL_GUARDIAN',
      details: policyCheck.rationale,
      payload: { policyCheck, strategy: finalStrategy, amount: transaction.amount }
    });

    // 7. EXECUTE (Only if Policy Approved)
    let executionResult = null;
    if (policyCheck.status === 'APPROVED') {
      executionResult = await ExecutionEngine.executeAction(transaction, finalStrategy, decision);
      decision.executionStatus = executionResult.success ? 'SUCCESS' : 'FAILED';
      decision.razorpayPaymentLinkId = executionResult.razorpayLinkId;
      decision.razorpayPaymentLinkUrl = executionResult.razorpayUrl;
      decision.executedAt = new Date().toISOString();

      // Trigger Webhook Observation Simulation for Demo (automatically recovers ₹9,999 or transaction amount!)
      if (body.simulateWebhook !== false) {
        OutcomeObserver.handleWebhook({
          event: 'payment_link.paid',
          payload: {
            payment_link: {
              entity: {
                id: executionResult.razorpayLinkId,
                amount: transaction.amount * 100,
                notes: { transaction_id: transaction.id }
              }
            }
          }
        });
      }
    }

    return NextResponse.json({
      decision,
      riskEvent,
      diagnosis,
      simulation,
      policyCheck,
      executionResult,
      redTeam
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
