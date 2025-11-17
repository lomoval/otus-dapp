// Phantom Wallet Network Detection Test
// This script helps diagnose network issues with Phantom wallet

async function testPhantomNetwork() {
    console.log('🔍 Phantom Wallet Network Detection Test\n');

    // Check if Phantom is installed
    if (typeof window === 'undefined') {
        console.log('❌ This script must be run in a browser environment');
        return;
    }

    const { solana } = window;

    if (!solana?.isPhantom) {
        console.log('❌ Phantom wallet not detected');
        console.log('   Please install Phantom browser extension');
        return;
    }

    console.log('✅ Phantom wallet detected');

    try {
        // Test 1: Check if we can connect to wallet
        console.log('\n1. Testing wallet connection...');
        const response = await solana.connect();
        console.log(`   ✅ Connected: ${response.publicKey.toString()}`);

        // Test 2: Try to get balance (this will reveal the network)
        console.log('\n2. Testing network via balance check...');
        const balance = await solana.request({
            method: 'getBalance',
            params: { publicKey: response.publicKey.toString() }
        });
        console.log(`   ✅ Balance check successful`);
        console.log(`   💰 Balance: ${(balance.value / 1e9).toFixed(4)} SOL`);

        // Test 3: Try to simulate a transaction to devnet program
        console.log('\n3. Testing devnet program interaction...');
        const programId = '5oomxe6gH81CKvmG7LtKQsg7Fws4cMJUjG6weZxBEPvo';

        try {
            // Create a simple transaction to test
            const transaction = {
                programId: programId,
                accounts: [
                    {
                        pubkey: response.publicKey,
                        isSigner: true,
                        isWritable: true
                    }
                ],
                data: new Uint8Array([0]) // Initialize instruction
            };

            const simulation = await solana.request({
                method: 'simulateTransaction',
                params: {
                    message: transaction,
                    signatures: []
                }
            });

            if (simulation.value.err) {
                console.log(`   ❌ Transaction simulation failed:`, simulation.value.err);
                console.log('   💡 This likely means Phantom is on Mainnet');
            } else {
                console.log('   ✅ Transaction simulation successful');
                console.log('   💡 Phantom appears to be on Devnet');
            }
        } catch (simError) {
            console.log(`   ❌ Transaction simulation error: ${simError.message}`);
            console.log('   💡 This usually means the program is not found (wrong network)');
        }

        // Test 4: Check network indicators
        console.log('\n4. Network indicators:');

        // Method 1: Try to get network info (may not be supported)
        try {
            const network = await solana.request({ method: 'getNetwork' });
            console.log(`   📡 Network API: ${network}`);
        } catch (error) {
            console.log(`   📡 Network API: Not supported (${error.message})`);
        }

        // Method 2: Check if we can access devnet-specific features
        try {
            const devnetConnection = new Connection('https://api.devnet.solana.com');
            const version = await devnetConnection.getVersion();
            console.log(`   🌐 Devnet RPC: Connected (${version['solana-core']})`);
        } catch (error) {
            console.log(`   🌐 Devnet RPC: Failed to connect`);
        }

        // Method 3: Check if mainnet RPC works
        try {
            const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com');
            const version = await mainnetConnection.getVersion();
            console.log(`   🌐 Mainnet RPC: Connected (${version['solana-core']})`);
        } catch (error) {
            console.log(`   🌐 Mainnet RPC: Failed to connect`);
        }

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    }

    // Provide user instructions
    console.log('\n📋 Quick Fix Instructions:');
    console.log('1. Open Phantom wallet extension');
    console.log('2. Click the Phantom icon in your browser toolbar');
    console.log('3. Click the gear icon (Settings)');
    console.log('4. Select "Developer Settings"');
    console.log('5. Click "Change Network"');
    console.log('6. Select "Devnet" from the list');
    console.log('7. Refresh this page and test again');
    console.log('\n⚠️  IMPORTANT: Transactions will fail if Phantom is on Mainnet!');
}

// Helper function to create Connection (simplified version)
class Connection {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
    }

    async getVersion() {
        const response = await fetch(this.rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getVersion',
                params: []
            })
        });
        const data = await response.json();
        return data.result;
    }
}

// Auto-run the test when script is loaded
if (typeof window !== 'undefined') {
    // Add a button to run the test
    const button = document.createElement('button');
    button.textContent = '🔍 Test Phantom Network';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 10px 15px;
        background: #512da8;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    `;
    button.onclick = testPhantomNetwork;
    document.body.appendChild(button);

    console.log('🔍 Phantom Network Test loaded');
    console.log('Click the "Test Phantom Network" button in the top-right corner');
}
