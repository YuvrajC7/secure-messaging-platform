// Load environment variables from the .env file FIRST
require('dotenv').config();

const { 
    generateKeyPair, 
    computeSharedSecret, 
    encryptMessage, 
    decryptMessage 
} = require('../client/encryption');
const { storeCiphertext, markAsDelivered } = require('./database');

async function simulateMessageFlow() {
    console.log("--- Testing ECDH Key Exchange & E2EE Flow ---");

    // ---------------------------------------------------------
    // PHASE 1: KEY EXCHANGE (The "Paint Mixing")
    // ---------------------------------------------------------
    console.log("\n[Client A] Generating key pair...");
    const keysA = generateKeyPair();
    
    console.log("[Client B] Generating key pair...");
    const keysB = generateKeyPair();

    console.log("\n[Network] Client A sends Public Key to Client B: ", keysA.publicKey.substring(0, 20) + "...");
    console.log("[Network] Client B sends Public Key to Client A: ", keysB.publicKey.substring(0, 20) + "...");

    // They mix the paints mathematically
    const sharedSecretA = computeSharedSecret(keysA.privateKey, keysB.publicKey);
    const sharedSecretB = computeSharedSecret(keysB.privateKey, keysA.publicKey);

    console.log(`\n[Client A] Computed Shared Secret: ${sharedSecretA.toString('hex').substring(0, 16)}...`);
    console.log(`[Client B] Computed Shared Secret: ${sharedSecretB.toString('hex').substring(0, 16)}...`);
    
    if (sharedSecretA.equals(sharedSecretB)) {
        console.log("✅ Math works! Both clients generated the exact same secret key without ever sending it!");
    } else {
        console.log("❌ Key mismatch error!");
        return;
    }

    // ---------------------------------------------------------
    // PHASE 2: MESSAGING (Using the newly computed key)
    // ---------------------------------------------------------
    const originalMessage = "Hello, this is a top secret message!";
    console.log("\n[Client A] Plaintext:", originalMessage);

    // Encrypt using A's calculated secret
    const ciphertext = encryptMessage(originalMessage, sharedSecretA);
    console.log("[Client A] Encrypted payload:", ciphertext);

    console.log("\n[Server] Received encrypted payload. Keys are unknown.");
    
    let savedMessageId = null;

    try {
        const savedMessage = await storeCiphertext('UserA', 'UserB', ciphertext);
        savedMessageId = savedMessage.id;
        console.log("[Server] (Simulated) Ciphertext persisted to Supabase with ID:", savedMessageId);
    } catch (err) {
        console.log("[Server] ❌ Failed to save to Supabase.");
    }

    console.log("\n[Client B] Received payload from socket:", ciphertext);

    // Decrypt using B's calculated secret
    const decryptedMessage = decryptMessage(ciphertext, sharedSecretB);
    console.log("[Client B] Decrypted plaintext:", decryptedMessage);
    
    if (savedMessageId) {
        console.log("\n[Server] Client B has read the message. Flipping 'delivered' to TRUE in database...");
        await markAsDelivered(savedMessageId);
    }

    console.log("\n--- E2EE Flow Complete ---");
}

// Execute test run
simulateMessageFlow();
