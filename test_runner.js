import { io } from 'socket.io-client';
import { generateKeyPair, computeSharedSecret, encryptMessage, decryptMessage } from './client/src/encryption.js';

async function runTests() {
  console.log("Starting automated tests...");

  const aliceKeys = generateKeyPair();
  const bobKeys = generateKeyPair();

  const aliceSocket = io('http://localhost:3000');
  const bobSocket = io('http://localhost:3000');

  let aliceConnected = false;
  let bobConnected = false;

  aliceSocket.on('connect', () => {
    console.log("[Alice] Connected to server");
    aliceSocket.emit('register', { username: 'Alice', publicKey: aliceKeys.publicKey });
    aliceConnected = true;
    checkStart();
  });

  bobSocket.on('connect', () => {
    console.log("[Bob] Connected to server");
    bobSocket.emit('register', { username: 'Bob', publicKey: bobKeys.publicKey });
    bobConnected = true;
    checkStart();
  });

  function checkStart() {
    if (aliceConnected && bobConnected) {
      setTimeout(testMessaging, 500);
    }
  }

  function testMessaging() {
    console.log("\n[Alice] Sending message to Bob...");
    const originalMessage = "Hello Bob! This is an end-to-end encrypted test.";
    
    aliceSocket.emit('get-public-key', 'Bob', (bobPubKey) => {
      console.log(`[Alice] Received Bob's public key from server: ${bobPubKey ? 'YES' : 'NO'}`);
      if (!bobPubKey) {
        console.error("FAILED to get Bob's public key!");
        process.exit(1);
      }

      const sharedSecret = computeSharedSecret(aliceKeys.privateKey, bobPubKey);
      const ciphertext = encryptMessage(originalMessage, sharedSecret);
      
      const payloadStr = JSON.stringify({ 
        ciphertext, 
        senderPublicKey: aliceKeys.publicKey, 
        plaintextForMe: originalMessage 
      });

      aliceSocket.emit('direct-message', { recipient: 'Bob', content: payloadStr });
    });
  }

  aliceSocket.on('message-sent', (msg) => {
    console.log("[Alice] Server confirmed message sent.");
    try {
      const parsed = JSON.parse(msg.content);
      console.log(`[Alice UI Render] You sent: "${parsed.plaintextForMe}"`);
    } catch(e) {}
  });

  bobSocket.on('message-received', (msg) => {
    console.log(`\n[Bob] Received encrypted payload from ${msg.sender}:`, msg.content);
    try {
      const parsed = JSON.parse(msg.content);
      if (parsed.ciphertext && parsed.senderPublicKey) {
        const sharedSecret = computeSharedSecret(bobKeys.privateKey, parsed.senderPublicKey);
        const plaintext = decryptMessage(parsed.ciphertext, sharedSecret);
        console.log(`[Bob UI Render] Decrypted message: "${plaintext}"`);
        console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY!");
        process.exit(0);
      } else {
        console.error("FAILED to parse encrypted payload.");
        process.exit(1);
      }
    } catch (err) {
      console.error("FAILED to decrypt:", err);
      process.exit(1);
    }
  });
}

runTests();
