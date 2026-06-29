const SandboxRunner = require('../utils/sandboxRunner');
describe('Sandbox Runner', () => {
  it('should run JS code securely', async () => {
    const res = await SandboxRunner.runCode('console.log("secure");');
    expect(res.output).toContain('secure');
  });
});
