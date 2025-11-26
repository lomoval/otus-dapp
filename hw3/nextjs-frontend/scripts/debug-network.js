// Network Debug Script for Solana Devnet
// Run this script to check network connectivity and Phantom wallet status

const { Connection, PublicKey } = require('@solana/web3.js');

async function debugNetwork() {
  console.log('🔍 Starting Solana Network Debug...\n');

  // Test different RPC endpoints
  const rpcEndpoints = [
    'https://api.devnet.solana.com',
    'https://devnet.helius-rpc.com/?api-key=default',
    'https://solana-devnet.g.alchemy.com/v2/demo'
  ];

  for (const rpcUrl of rpcEndpoints) {
    console.log(`Testing RPC: ${rpcUrl}`);
    try {
      const connection = new Connection(rpcUrl, 'confirmed');
      const version = await connection.getVersion();
      const slot = await connection.getSlot();
      const genesisHash = await connection.getGenesisHash();

      console.log(`✅ Connected successfully`);
      console.log(`   Solana version: ${version['solana-core']}`);
      console.log(`   Current slot: ${slot}`);
      console.log(`   Genesis hash: ${genesisHash}`);
      console.log(`   Network: ${genesisHash.startsWith('Et9') ? 'Devnet ✅' : 'Unknown ❌'}`);
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
    console.log('');
  }

  // Check Phantom wallet status
  console.log('👛 Phantom Wallet Status:');
  if (typeof window !== 'undefined' && window.solana) {
    const { solana } = window;
    console.log(`✅ Phantom wallet detected: ${solana.isPhantom}`);

    try {
      const network = await solana.request({ method: 'getNetwork' });
      console.log(`   Current network: ${network}`);
      console.log(`   Network status: ${network === 'devnet' ? '✅ Correct (Devnet)' : '❌ WRONG - Switch to Devnet!'}`);
    } catch (error) {
      console.log(`   Network check failed: ${error.message}`);
    }
  } else {
    console.log('❌ Phantom wallet not detected');
  }

  console.log('\n📋 Quick Fix Instructions:');
  console.log('1. Open Phantom wallet extension');
  console.log('2. Click on the Phantom icon in your browser');
  console.log('3. Go to Settings → Networks');
  console.log('4. Select "Devnet"');
  console.log('5. Refresh the page and try again');
}

// Run the debug function
if (typeof window !== 'undefined') {
  debugNetwork().catch(console.error);
} else {
  console.log('This script should be run in a browser environment');
}
