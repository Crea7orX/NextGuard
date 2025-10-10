#ifndef CRYPTO_MANAGER_H
#define CRYPTO_MANAGER_H

#include <Arduino.h>

class CryptoManager {
public:
    CryptoManager();
    
    // Base64 encoding/decoding
    static String base64Encode(const uint8_t* data, size_t len);
    static size_t base64Decode(const String& str, uint8_t* out, size_t outlen);
    
    // Random number generation
    static void randomBytes(uint8_t* out, size_t len);
    
    // HMAC-SHA256
    static bool hmacSha256(const uint8_t* key, size_t keylen, 
                          const uint8_t* data, size_t datalen, 
                          uint8_t out[32]);
    
    // HKDF-SHA256 (single block)
    static bool hkdfSha256(const uint8_t* ikm, size_t ikmLen,
                          const uint8_t* salt, size_t saltLen,
                          const uint8_t* info, size_t infoLen,
                          uint8_t out[32]);
    
    // SHA256 hash
    static bool sha256(const uint8_t* data, size_t len, uint8_t out[32]);
    
    // ECDSA key generation (secp256r1)
    static bool generateECDSAKeyPair(String& outPrivPem, String& outPubPem);
    
    // ECDSA signing
    static bool signSha256(const String& privPem, const uint8_t digest[32], String& sigB64);
    
    // ECDSA verification
    static bool verifySha256(const String& pubPem, const uint8_t digest[32], const String& sigB64);
};

#endif // CRYPTO_MANAGER_H
