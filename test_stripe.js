require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  try {
    const customer = await stripe.customers.retrieve('cus_UT8mF3bRqlrzAE');
    console.log("Customer:", customer);
    
    const session = await stripe.checkout.sessions.create({
      customer: 'cus_UT8mF3bRqlrzAE',
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TU8m5PcWUVwpJOwXrI8ilBt',
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/app',
      cancel_url: 'http://localhost:3000/pricing',
    });
    console.log("Session:", session.url);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
