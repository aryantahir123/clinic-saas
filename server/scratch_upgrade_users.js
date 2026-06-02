require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function upgradeAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany({}, { subscriptionPlan: 'pro' });
    console.log(`Upgraded ${result.modifiedCount} users to PRO.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

upgradeAll();
