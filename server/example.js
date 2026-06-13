// Load environment variables from the .env file FIRST
require('dotenv').config();

const { encryptMessage, decryptMessage } = require('../client/encryption');
const { storeCiphertext, markAsDelivered } = require('./database');

// Mock E2EE flow demonstrating client-side encryption and server-side storage
async function simulateMessageFlow() {
    console.log("--- Testing E2EE Flow ---");

    // 1. Client A: Encrypt outbound message
    const originalMessage = "Hello, this is a top secret message!";
    console.log("\n[Client A] Plaintext:", originalMessage);

    const ciphertext = encryptMessage(originalMessage);
    console.log("[Client A] Encrypted payload:", ciphertext);

    // 2. Server: Receive and persist ciphertext
    // Note: Assuming Socket.IO transmits 'ciphertext' to the backend
    console.log("\n[Server] Received encrypted payload. Keys are unknown.");
    
    let savedMessageId = null;

    // Attempt to store in Supabase!
    // This will error if the .env file isn't set up correctly with real Supabase credentials.
    try {
        const savedMessage = await storeCiphertext('UserA', 'UserB', ciphertext);
        savedMessageId = savedMessage.id;
        console.log("[Server] (Simulated) Ciphertext persisted to DB with ID:", savedMessageId);
    } catch (err) {
        console.log("[Server] ❌ Failed to save to Supabase. Did you set up the .env file and create the table?");
    }

    // 3. Client B: Receive and decrypt payload
    console.log("\n[Client B] Received payload from socket:", ciphertext);

    const decryptedMessage = decryptMessage(ciphertext);
    console.log("[Client B] Decrypted plaintext:", decryptedMessage);
    
    // 4. Server: Flip delivered to TRUE since Client B received it!
    if (savedMessageId) {
        console.log("\n[Server] Client B has read the message. Flipping 'delivered' to TRUE in database...");
        await markAsDelivered(savedMessageId);
    }

    console.log("\n--- E2EE Flow Complete ---");
}

// Execute test run
simulateMessageFlow();
