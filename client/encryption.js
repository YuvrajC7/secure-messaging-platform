const crypto = require('crypto');

// TODO: Replace static shared key with secure key exchange (e.g., ECDH) in production
const SHARED_SECRET_KEY = Buffer.from('12345678901234567890123456789012');

/**
 * Encrypts a message using AES-256-GCM.
 * @param {string} text - Plaintext message
 * @returns {string} - Format: iv:ciphertext:authTag
 */
function encryptMessage(text) {
    // Generate 12-byte IV for GCM
    const iv = crypto.randomBytes(12);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', SHARED_SECRET_KEY, iv);
    
    let ciphertext = cipher.update(text, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    // Package payload
    return `${iv.toString('hex')}:${ciphertext}:${authTag.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM encrypted message.
 * @param {string} encryptedData - Format: iv:ciphertext:authTag
 * @returns {string} - Decrypted plaintext
 */
function decryptMessage(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const ciphertext = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', SHARED_SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
}

module.exports = {
    encryptMessage,
    decryptMessage
};
