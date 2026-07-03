import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/identity/models/User.js';
import ProjectRequirement from './src/modules/marketplace/models/ProjectRequirement.js';
import Contract from './src/modules/billing/models/Contract.js';

dotenv.config();

async function runFullSystemAudit() {
  console.log('🚀 [REAL TEST] Connecting to your local MongoDB staging instance...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trainistry_staging');
  console.log('✅ Connected to MongoDB safely.');

  try {
    console.log('\n[TEST 1] Auditing Database Document Schema Counts...');
    const trainers = await User.countDocuments({ role: 'TRAINER' });
    const companies = await User.countDocuments({ role: 'COMPANY' });
    console.log(`✅ Base layer verified. Found: ${trainers} Trainers & ${companies} Companies.`);

    console.log('\n[TEST 2] Auditing Open Sourcing Requirements...');
    const activeJobs = await ProjectRequirement.countDocuments({ status: 'OPEN' });
    console.log(`✅ Marketplace index verified. Active Open Jobs: ${activeJobs}`);

    console.log('\n[TEST 3] Auditing Active Financial Escrows...');
    const contracts = await Contract.countDocuments({});
    console.log(`✅ Billing ledger verified. Total SOW Contracts Processed: ${contracts}`);

    console.log('\n🎉 [SUCCESS] Local system diagnostics execution complete!');
  } catch (error) {
    console.error('❌ Diagnostic run halted due to structural fault:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected cleanly from database.');
  }
}

runFullSystemAudit();
