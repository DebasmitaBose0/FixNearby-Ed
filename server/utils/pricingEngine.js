class PricingEngine {
  static calculateQuote(baseRate, categoryDemandFactor = 1.0, distanceKm = 0, isPeakHour = false) {
    let multiplier = 1.0;
    if (isPeakHour) multiplier += 0.25;
    if (categoryDemandFactor > 1.5) multiplier += 0.35;

    const distanceFee = distanceKm * 2.5;
    const finalRate = Math.round((baseRate * multiplier + distanceFee) * 100) / 100;

    return {
      baseRate,
      multiplier,
      distanceFee,
      surgeAmount: Math.round((finalRate - baseRate - distanceFee) * 100) / 100,
      finalRate
    };
  }
}

module.exports = PricingEngine;
