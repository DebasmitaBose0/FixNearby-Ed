import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_fixnearby_secret_key_12345';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2,
});

export default stripe;
