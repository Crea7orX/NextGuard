#include "EncryptionUtils.h"

void EncryptionUtils::setKey(AES128& aes, const uint8_t* sessionKey) {
    aes.setKey(sessionKey, SESSION_KEY_SIZE);
}

void EncryptionUtils::generateNonce(uint8_t* nonce) {
    for (int i = 0; i < NONCE_SIZE; i++) {
        nonce[i] = esp_random() & 0xFF;
    }
}

void EncryptionUtils::prepareIV(uint8_t* iv, const uint8_t* nodeId, uint32_t counter, const uint8_t* nonce) {
    memset(iv, 0, AES_BLOCK_SIZE);
    memcpy(iv, nodeId, 4);                    // First 4 bytes of UUID
    memcpy(iv + 4, &counter, 4);              // 32-bit counter
    memcpy(iv + 8, nonce, NONCE_SIZE);        // 8-byte nonce
}

int EncryptionUtils::encryptData(AES128& aes, const uint8_t* plaintext, size_t plaintextLen,
                                 uint8_t* ciphertext, const uint8_t* iv) {
    uint8_t tempBlock[AES_BLOCK_SIZE];
    uint8_t currentIV[AES_BLOCK_SIZE];
    memcpy(currentIV, iv, AES_BLOCK_SIZE);
    
    // Encrypt blocks using CBC mode
    for (size_t i = 0; i < plaintextLen; i += AES_BLOCK_SIZE) {
        // XOR plaintext with IV for CBC mode
        for (int j = 0; j < AES_BLOCK_SIZE; j++) {
            tempBlock[j] = plaintext[i + j] ^ currentIV[j];
        }
        // Encrypt block
        aes.encryptBlock(ciphertext + i, tempBlock);
        // Use ciphertext as IV for next block
        memcpy(currentIV, ciphertext + i, AES_BLOCK_SIZE);
    }
    
    return plaintextLen;
}

int EncryptionUtils::decryptData(AES128& aes, const uint8_t* ciphertext, size_t ciphertextLen,
                                 uint8_t* plaintext, const uint8_t* iv) {
    uint8_t tempBlock[AES_BLOCK_SIZE];
    uint8_t currentIV[AES_BLOCK_SIZE];
    memcpy(currentIV, iv, AES_BLOCK_SIZE);
    
    // Decrypt blocks using CBC mode
    for (size_t i = 0; i < ciphertextLen; i += AES_BLOCK_SIZE) {
        // Decrypt block
        aes.decryptBlock(tempBlock, ciphertext + i);
        // XOR with IV (previous ciphertext block)
        for (int j = 0; j < AES_BLOCK_SIZE; j++) {
            plaintext[i + j] = tempBlock[j] ^ currentIV[j];
        }
        // Save current ciphertext as IV for next block
        memcpy(currentIV, ciphertext + i, AES_BLOCK_SIZE);
    }
    
    return ciphertextLen;
}

size_t EncryptionUtils::applyPadding(uint8_t* buffer, size_t dataLen, size_t maxLen) {
    // Pad to 16 byte boundary using 0x80 marker + zeros
    size_t paddedLen = ((dataLen + 15) / 16) * 16;
    
    if (paddedLen > maxLen) {
        return 0; // Not enough space
    }
    
    memset(buffer + dataLen, 0, paddedLen - dataLen);
    buffer[dataLen] = 0x80; // Padding marker
    
    return paddedLen;
}

size_t EncryptionUtils::removePadding(const uint8_t* buffer, size_t bufferLen) {
    // Find the 0x80 padding marker
    for (int i = bufferLen - 1; i >= 0; i--) {
        if (buffer[i] == 0x80) {
            return i;
        }
        if (buffer[i] != 0x00) {
            break; // Invalid padding
        }
    }
    return bufferLen; // No padding found or invalid
}

size_t EncryptionUtils::encryptPacket(AES128& aes,
                                     const uint8_t* nodeId,
                                     const uint8_t* sessionKey,
                                     uint32_t counter,
                                     uint8_t msgType,
                                     const char* plaintext,
                                     uint8_t* packet) {
    int len = strlen(plaintext);
    
    // Prepare plaintext with padding
    uint8_t paddedPlaintext[128];
    memset(paddedPlaintext, 0, sizeof(paddedPlaintext));
    memcpy(paddedPlaintext, plaintext, len);
    size_t paddedLen = applyPadding(paddedPlaintext, len, sizeof(paddedPlaintext));
    
    if (paddedLen == 0) {
        return 0;
    }
    
    // Generate nonce
    uint8_t nonce[NONCE_SIZE];
    generateNonce(nonce);
    
    // Prepare IV
    uint8_t iv[AES_BLOCK_SIZE];
    prepareIV(iv, nodeId, counter, nonce);
    
    // Set encryption key
    setKey(aes, sessionKey);
    
    // Encrypt
    uint8_t ciphertext[128];
    encryptData(aes, paddedPlaintext, paddedLen, ciphertext, iv);
    
    // Build packet: type + nodeId + counter + nonce + origLen + ciphertext
    size_t offset = 0;
    packet[offset++] = msgType;
    memcpy(packet + offset, nodeId, UUID_SIZE);
    offset += UUID_SIZE;
    memcpy(packet + offset, &counter, 4);
    offset += 4;
    memcpy(packet + offset, nonce, NONCE_SIZE);
    offset += NONCE_SIZE;
    packet[offset++] = (uint8_t)len;  // Original length
    memcpy(packet + offset, ciphertext, paddedLen);
    offset += paddedLen;
    
    // Compute HMAC over everything except HMAC itself
    uint8_t hmac[HMAC_SIZE];
    SecurityUtils::computeHMAC(sessionKey, SESSION_KEY_SIZE, packet, offset, hmac);
    memcpy(packet + offset, hmac, HMAC_SIZE);
    offset += HMAC_SIZE;
    
    return offset;
}

bool EncryptionUtils::decryptPacket(AES128& aes,
                                   const uint8_t* packet,
                                   size_t packetLen,
                                   const uint8_t* sessionKey,
                                   uint32_t expectedCounter,
                                   uint8_t* plaintext,
                                   size_t* plaintextLen) {
    // Minimum packet size check
    if (packetLen < ProtocolUtils::getMinDataPacketSize()) {
        return false;
    }
    
    // Verify HMAC first (last 32 bytes)
    size_t hmacDataLen = packetLen - HMAC_SIZE;
    const uint8_t* receivedHmac = packet + hmacDataLen;
    
    if (!SecurityUtils::verifyHMAC(sessionKey, SESSION_KEY_SIZE, packet, hmacDataLen, receivedHmac)) {
        return false;
    }
    
    // Extract fields
    size_t offset = 1; // Skip message type
    const uint8_t* nodeId = packet + offset;
    offset += UUID_SIZE;
    
    uint32_t counter;
    memcpy(&counter, packet + offset, 4);
    offset += 4;
    
    const uint8_t* nonce = packet + offset;
    offset += NONCE_SIZE;
    
    uint8_t origLen = packet[offset++];
    
    const uint8_t* ciphertext = packet + offset;
    size_t ciphertextLen = hmacDataLen - offset;
    
    // Counter validation
    if (counter < expectedCounter) {
        return false;
    }
    
    // Prepare IV
    uint8_t iv[AES_BLOCK_SIZE];
    prepareIV(iv, nodeId, counter, nonce);
    
    // Set decryption key
    setKey(aes, sessionKey);
    
    // Decrypt
    decryptData(aes, ciphertext, ciphertextLen, plaintext, iv);
    
    // Set plaintext length (original, not padded)
    *plaintextLen = origLen;
    
    return true;
}
