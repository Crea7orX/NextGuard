#ifndef SECURITY_UTILS_H
#define SECURITY_UTILS_H

#include <Arduino.h>
#include <uECC.h>
#include <SHA256.h>

class SecurityUtils {
public:
    // Random number generation for uECC
    static int getRng(uint8_t* dest, unsigned size);
    
    // ECDH Key pair generation (secp160r1)
    static bool generateKeyPair(uint8_t* privateKey, uint8_t* publicKey);
    
    // ECDH shared secret computation
    static bool computeSharedSecret(const uint8_t* theirPublicKey, 
                                   const uint8_t* myPrivateKey, 
                                   uint8_t* sharedSecret);
    
    // Derive session key from shared secret (XOR fold to 16 bytes)
    static void deriveSessionKey(const uint8_t* sharedSecret, uint8_t* sessionKey);
    
    // HMAC-SHA256 for packet authentication
    static void computeHMAC(const uint8_t* key, size_t keyLen, 
                           const uint8_t* data, size_t dataLen, 
                           uint8_t* hmac);
    
    // Verify HMAC with constant-time comparison
    static bool verifyHMAC(const uint8_t* key, size_t keyLen, 
                          const uint8_t* data, size_t dataLen, 
                          const uint8_t* receivedHmac);
};

#endif // SECURITY_UTILS_H
