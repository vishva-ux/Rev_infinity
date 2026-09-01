import { Transaction, CustomerProfile, SimulationScenario, SimulationResult, StrategyType } from '../../types';

export class RecoveryPredictionEngine {
  /**
   * Deterministic recovery probability model based on payment method, customer DNA, failure type.
   */
  public static predictBaselineProbability(transaction: Transaction, customer?: CustomerProfile): number {
    let prob = 0.50; // Base 50%

    if (customer) {
      if (customer.ltv > 50000) prob += 0.12;
      if (customer.successCount > 10) prob += 0.10;
    }

    if (transaction.paymentMethod === 'UPI') prob += 0.08;
    else if (transaction.paymentMethod === 'CARD') prob += 0.04;

    if (transaction.retryCount >= 2) prob -= 0.25;

    return Math.min(0.95, Math.max(0.05, prob));
  }
}

export class FutureSimulator {
  /**
   * HERO FEATURE: Multi-Future Scenario Simulator
   * Simulates 6 counterfactual intervention scenarios for a transaction or batch.
   */
  public static simulate(transaction: Transaction, customer?: CustomerProfile): SimulationResult {
    const amount = transaction.amount;
    const baseProb = RecoveryPredictionEngine.predictBaselineProbability(transaction, customer);

    const scenarios: SimulationScenario[] = [
      {
        strategy: 'DO_NOTHING',
        name: 'Do Nothing',
        description: 'Passive waiting without customer intervention',
        expectedRecovery: Math.round(amount * 0.08),
        confidence: 0.88,
        interventionCost: 0,
        customerFriction: 'Low',
        riskPenalty: Math.round(amount * 0.20),
        netImpact: Math.round(amount * 0.08) - Math.round(amount * 0.20),
      },
      {
        strategy: 'RETRY',
        name: 'Retry Strategy',
        description: 'Automated background payment retry through gateway',
        expectedRecovery: transaction.retryCount >= 2 ? Math.round(amount * 0.05) : Math.round(amount * (baseProb * 0.70)),
        confidence: 0.35,
        interventionCost: 45,
        customerFriction: 'Medium',
        riskPenalty: transaction.retryCount >= 2 ? Math.round(amount * 0.40) : Math.round(amount * 0.10),
        netImpact: (transaction.retryCount >= 2 ? Math.round(amount * 0.05) : Math.round(amount * (baseProb * 0.70))) - 45 - (transaction.retryCount >= 2 ? Math.round(amount * 0.40) : Math.round(amount * 0.10)),
      },
      {
        strategy: 'PAYMENT_LINK',
        name: 'Payment Link',
        description: 'Instant Razorpay Smart Payment Link via WhatsApp/SMS',
        expectedRecovery: Math.round(amount * (baseProb * 1.15)),
        confidence: 0.72,
        interventionCost: 0,
        customerFriction: 'Low',
        riskPenalty: Math.round(amount * 0.04),
        netImpact: Math.round(amount * (baseProb * 1.15)) - 0 - Math.round(amount * 0.04),
      },
      {
        strategy: 'REMINDER',
        name: 'Smart Reminder',
        description: 'Soft payment reminder at customer preferred time window',
        expectedRecovery: Math.round(amount * (baseProb * 0.95)),
        confidence: 0.65,
        interventionCost: 12,
        customerFriction: 'Low',
        riskPenalty: Math.round(amount * 0.06),
        netImpact: Math.round(amount * (baseProb * 0.95)) - 12 - Math.round(amount * 0.06),
      },
      {
        strategy: 'ALTERNATE_METHOD',
        name: 'Alternate Payment',
        description: 'Prompt customer to complete checkout via alternate UPI / Card',
        expectedRecovery: Math.round(amount * (baseProb * 1.08)),
        confidence: 0.68,
        interventionCost: 0,
        customerFriction: 'Medium',
        riskPenalty: Math.round(amount * 0.05),
        netImpact: Math.round(amount * (baseProb * 1.08)) - 0 - Math.round(amount * 0.05),
      },
      {
        strategy: 'SMART_RECOVERY',
        name: 'Smart Recovery',
        description: 'Adaptive combination: Instant Payment Link + Optimal timing + Failover',
        expectedRecovery: Math.round(amount * (baseProb * 1.32)),
        confidence: 0.85,
        interventionCost: 18,
        customerFriction: 'Low',
        riskPenalty: Math.round(amount * 0.02),
        netImpact: Math.round(amount * (baseProb * 1.32)) - 18 - Math.round(amount * 0.02),
        isRecommended: true
      },
      {
        strategy: 'AGGRESSIVE_RECOVERY',
        name: 'Aggressive Recovery',
        description: 'Multi-channel outbound alert + repeated link dispatch',
        expectedRecovery: Math.round(amount * (baseProb * 1.20)),
        confidence: 0.61,
        interventionCost: 85,
        customerFriction: 'High',
        riskPenalty: Math.round(amount * 0.15),
        netImpact: Math.round(amount * (baseProb * 1.20)) - 85 - Math.round(amount * 0.15),
      }
    ];

    // Find recommended strategy with highest netImpact
    let bestScenario = scenarios[0];
    scenarios.forEach(s => {
      if (s.netImpact > bestScenario.netImpact) bestScenario = s;
    });

    scenarios.forEach(s => {
      s.isRecommended = s.strategy === bestScenario.strategy;
    });

    return {
      id: `SIM_${transaction.id}`,
      transactionId: transaction.id,
      baselineAmount: amount,
      scenarios,
      recommendedStrategy: bestScenario.strategy,
      expectedNetRecovery: bestScenario.expectedRecovery,
      confidence: bestScenario.confidence,
      rationale: `Strategy ${bestScenario.name} produces highest risk-adjusted expected recovery (₹${bestScenario.expectedRecovery.toLocaleString('en-IN')}) with confidence ${(bestScenario.confidence * 100).toFixed(0)}%.`,
      createdAt: new Date().toISOString()
    };
  }
}
