/**
 * Advanced Circuit Breaker Pattern implementation for Microservices.
 * Prevents cascading service failures when calling external payment/SMS gateways.
 * States: CLOSED (Normal), OPEN (Failing), HALF_OPEN (Probing recovery).
 */

export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 5000; // 5 seconds recovery timeout

    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(requestFn, fallbackFn) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        if (typeof fallbackFn === 'function') {
          return fallbackFn(new Error('Circuit breaker is OPEN'));
        }
        throw new Error('Circuit breaker is OPEN. Fast failing request.');
      }
    }

    try {
      const response = await requestFn();
      this.onSuccess();
      return response;
    } catch (err) {
      this.onFailure();
      if (typeof fallbackFn === 'function') {
        return fallbackFn(err);
      }
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  onFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttemptInMs: Math.max(0, this.nextAttempt - Date.now())
    };
  }
}
