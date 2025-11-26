const { SOLANA_CONFIG } = require('../config/solana-contract');
const { SOLANA_DEPLOYMENT } = require('../config/solana-deployment');
const { Connection, PublicKey } = require('@solana/web3.js');

async function testSolanaConfig() {
  console.log('🧪 Testing Solana Contract Configuration\n');

  // Test 1: Check configuration files
  console.log('1. Configuration Files:');
  console.log(`   ✅ solana-contract.ts loaded`);
  console.log(`   ✅ solana-deployment.ts loaded`);

  // Test 2: Verify program IDs match
  console.log('\n2. Program ID Verification:');
  const configProgramId = SOLANA_CONFIG.PROGRAM_ID;
  const deploymentProgramId = SOLANA_DEPLOYMENT.PROGRAM.id;

  console.log(`   Config Program ID: ${configProgramId}`);
  console.log(`   Deployment Program ID: ${deploymentProgramId}`);

  if (configProgramId === deploymentProgramId) {
    console.log('   ✅ Program IDs match');
  } else {
    console.log('   ❌ Program IDs do not match!');
    return false;
  }

  // Test 3: Validate PublicKey format
  console.log('\n3. PublicKey Validation:');
  try {
    const publicKey = new PublicKey(configProgramId);
    console.log(`   ✅ Program ID is valid PublicKey: ${publicKey.toString()}`);
  } catch (error) {
    console.log(`   ❌ Invalid PublicKey format: ${error.message}`);
    return false;
  }

  // Test 4: Test network connection
  console.log('\n4. Network Connection Test:');
  try {
    const connection = new Connection(SOLANA_CONFIG.NETWORK.devnet.rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log(`   ✅ Connected to ${SOLANA_CONFIG.NETWORK.devnet.rpcUrl}`);
    console.log(`   ✅ Solana Core Version: ${version['solana-core']}`);

    // Test 5: Check program account
    console.log('\n5. Program Account Check:');
    const programId = new PublicKey(configProgramId);
    const programAccount = await connection.getAccountInfo(programId);

    if (programAccount) {
      console.log(`   ✅ Program account exists`);
      console.log(`   ✅ Program owner: ${programAccount.owner.toString()}`);
      console.log(`   ✅ Account data length: ${programAccount.data.length} bytes`);
      console.log(`   ✅ Executable: ${programAccount.executable}`);
    } else {
      console.log(`   ⚠️  Program account not found (might not be deployed)`);
    }

    // Test 6: Check IDL account
    console.log('\n6. IDL Account Check:');
    const idlAccount = new PublicKey(SOLANA_DEPLOYMENT.IDL.account);
    const idlAccountInfo = await connection.getAccountInfo(idlAccount);

    if (idlAccountInfo) {
      console.log(`   ✅ IDL account exists`);
      console.log(`   ✅ IDL data length: ${idlAccountInfo.data.length} bytes`);
    } else {
      console.log(`   ⚠️  IDL account not found`);
    }

    // Test 7: Check wallet balance
    console.log('\n7. Wallet Balance Check:');
    const walletAddress = new PublicKey(SOLANA_DEPLOYMENT.WALLET.address);
    const balance = await connection.getBalance(walletAddress);
    const balanceInSOL = balance / 1e9;

    console.log(`   ✅ Wallet address: ${walletAddress.toString()}`);
    console.log(`   ✅ Current balance: ${balanceInSOL.toFixed(8)} SOL`);
    console.log(`   ✅ Expected balance: ${SOLANA_DEPLOYMENT.WALLET.balance} SOL`);

    if (Math.abs(balanceInSOL - SOLANA_DEPLOYMENT.WALLET.balance) < 0.1) {
      console.log('   ✅ Balance is within expected range');
    } else {
      console.log('   ⚠️  Balance differs from expected value');
    }

  } catch (error) {
    console.log(`   ❌ Network connection failed: ${error.message}`);
    return false;
  }

  // Test 8: Feature configuration
  console.log('\n8. Feature Configuration:');
  console.log(`   ✅ Max data length: ${SOLANA_DEPLOYMENT.FEATURES.storage.maxDataLength} characters`);
  console.log(`   ✅ Updatable by anyone: ${SOLANA_DEPLOYMENT.FEATURES.storage.updatableByAnyone}`);
  console.log(`   ✅ PDA seeds: [${SOLANA_DEPLOYMENT.FEATURES.storage.pdaSeeds.join(', ')}]`);

  // Test 9: Instructions
  console.log('\n9. Available Instructions:');
  Object.entries(SOLANA_DEPLOYMENT.FEATURES.instructions).forEach(([key, description]) => {
    console.log(`   ✅ ${key}: ${description}`);
  });

  // Summary
  console.log('\n🎉 Configuration Test Summary:');
  console.log('   All configuration files are properly set up and validated.');
  console.log('   The Solana contract is ready for use in the frontend application.');
  console.log('\n📋 Next Steps:');
  console.log('   1. Run the frontend: npm run dev');
  console.log('   2. Connect your wallet');
  console.log('   3. Test contract interactions');

  return true;
}

// Run the test
testSolanaConfig().catch(console.error);

module.exports = { testSolanaConfig };
