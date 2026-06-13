const crypto = require('crypto');

/**
 * Generates an Elliptic Curve Diffie-Hellman (ECDH) key pair.
 * @returns {Object} { privateKey, publicKey } both as hex strings
 */
function generateKeyPair() {
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.generateKeys();
    return {
        privateKey: ecdh.getPrivateKey('hex'),
        publicKey: ecdh.getPublicKey('hex')
    };
}

/**
 * Computes the 32-byte shared secret using my private key and their public key.
 * @param {string} myPrivateKeyHex - Your secret private key
 * @param {string} theirPublicKeyHex - The public key sent by the other user
 * @returns {Buffer} - The resulting mathematical shared secret (32 bytes)
 */
function computeSharedSecret(myPrivateKeyHex, theirPublicKeyHex) {
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(myPrivateKeyHex, 'hex');
    
    // Mix "our private" with "their public"
    const sharedSecret = ecdh.computeSecret(theirPublicKeyHex, 'hex');
    return sharedSecret; // Returns a Buffer, exactly what AES-256 needs
}

/**
 * Encrypts a message using AES-256-GCM.
 * @param {string} text - Plaintext message
 * @param {Buffer} sharedKey - The computed shared secret buffer
 * @returns {string} - Format: iv:ciphertext:authTag
 */
function encryptMessage(text, sharedKey) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', sharedKey, iv);
    
    let ciphertext = cipher.update(text, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${ciphertext}:${authTag.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM encrypted message.
 * @param {string} encryptedData - Format: iv:ciphertext:authTag
 * @param {Buffer} sharedKey - The computed shared secret buffer
 * @returns {string} - Decrypted plaintext
 */
function decryptMessage(encryptedData, sharedKey) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const ciphertext = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', sharedKey, iv);
    decipher.setAuthTag(authTag);
    
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
}

module.exports = {
    generateKeyPair,
    computeSharedSecret,
    encryptMessage,
    decryptMessage
};
