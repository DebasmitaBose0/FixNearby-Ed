import { validateWalletAmount, sanitizeWalletDescription } from '../services/walletVerificationService.js';

console.log('=== STARTING WALLET TRANSACTION VERIFICATION TEST ===\n');

// 1. Test negative and zero amount rejection
console.log('1. Testing invalid amount boundary validation...');
const zeroCheck = validateWalletAmount(0);
console.log('Zero Amount Result:', zeroCheck);

if (!zeroCheck.valid) {
  console.log('✅ SUCCESS: Zero/negative top-up amount cleanly rejected!');
} else {
  console.error('❌ FAIL: Failed to reject invalid topup amount!');
  process.exit(1);
}

// 2. Test excessive amount rejection
console.log('\n2. Testing excessive top-up limit enforcement ($5,000 max)...');
const excessiveCheck = validateWalletAmount(10000);
console.log('Excessive Topup Result:', excessiveCheck);

if (!excessiveCheck.valid && excessiveCheck.reason.includes('exceed')) {
  console.log('✅ SUCCESS: Top-up amount exceeding $5,000 threshold rejected!');
} else {
  console.error('❌ FAIL: Excessive limit check failed!');
  process.exit(1);
}

// 3. Test description sanitization
console.log('\n3. Testing description HTML/Script sanitization...');
const rawDesc = 'Wallet topup <script>alert("hack")</script>';
const cleanDesc = sanitizeWalletDescription(rawDesc);
console.log('Sanitized Description:', cleanDesc);

if (!cleanDesc.includes('<') && !cleanDesc.includes('>')) {
  console.log('✅ SUCCESS: Unsafe tags removed from description!');
} else {
  console.error('❌ FAIL: Description sanitization failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL WALLET TRANSACTION VERIFICATION TESTS PASSED!');
console.log('=============================================\n');
