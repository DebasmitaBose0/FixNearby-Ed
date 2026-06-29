const { exec } = require('child_process');
class SandboxRunner {
  static runCode(code, language = 'javascript', timeout = 5000) {
    return new Promise((resolve, reject) => {
      let cmd = '';
      if (language === 'javascript') {
        cmd = `node -e "${code.replace(/"/g, '\"')}"`;
      } else {
        return reject(new Error('Language not supported'));
      }
      exec(cmd, { timeout }, (err, stdout, stderr) => {
        if (err && err.killed) resolve({ error: 'Execution Timeout' });
        else if (err) resolve({ error: stderr || err.message });
        else resolve({ output: stdout });
      });
    });
  }
}
module.exports = SandboxRunner;
