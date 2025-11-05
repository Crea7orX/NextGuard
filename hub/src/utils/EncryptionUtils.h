#ifndef ENCRYPTION_UTILS_H
#define ENCRYPTION_UTILS_H

#include <Arduino.h>
#include <AES.h>
#include <utils/ProtocolUtils.h>
#include <utils/SecurityUtils.h>

class EncryptionUtils {
public:
    // Initialize with session key
    static void setKey(AES128& aes, const uint8_t* sessionKey);
    
    // Generate random nonce
    static void generateNonce(uint8_t* nonce);
    
    // Prepare IV from node ID, counter, and nonce
    static void prepareIV(uint8_t* iv, const uint8_t* nodeId, uint32_t counter, const uint8_t* nonce);
    
    // Encrypt data with AES-CBC
    static int encryptData(AES128& aes, const uint8_t* plaintext, size_t plaintextLen,
                          uint8_t* ciphertext, const uint8_t* iv);
    
    // Decrypt data with AES-CBC
    static int decryptData(AES128& aes, const uint8_t* ciphertext, size_t ciphertextLen,
                          uint8_t* plaintext, const uint8_t* iv);
    
    // Apply PKCS#7 padding
    static size_t applyPadding(uint8_t* buffer, size_t dataLen, size_t maxLen);
    
    // Remove PKCS#7 padding
    static size_t removePadding(const uint8_t* buffer, size_t bufferLen);
    
    // Encrypt and build complete packet (includes counter, nonce, and HMAC)
    static size_t encryptPacket(AES128& aes, 
                               const uint8_t* nodeId,
                               const uint8_t* sessionKey,
                               uint32_t counter,
                               uint8_t msgType,
                               const char* plaintext,
                               uint8_t* packet);
    
    // Decrypt and validate complete packet (verifies HMAC and counter)
    static bool decryptPacket(AES128& aes,
                             const uint8_t* packet,
                             size_t packetLen,
                             const uint8_t* sessionKey,
                             uint32_t expectedCounter,
                             uint8_t* plaintext,
                             size_t* plaintextLen);
};

#endif // ENCRYPTION_UTILS_H
