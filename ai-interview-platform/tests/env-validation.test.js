const { execSync } = require('child_process');
describe('Environment Validation Script', () => {
  it('should be executable', () => {
    const out = execSync('node ai-interview-platform/scripts/validate-env.js');
    expect(out.toString()).toContain('validation');
  });
});
