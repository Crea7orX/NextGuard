#include "SecurityUtils.h"

int SecurityUtils::getRng(uint8_t* dest, unsigned size) {
    for (unsigned i = 0; i < size; i++) {
        dest[i] = esp_random() & 0xFF;
    }
    return 1;
}

bool SecurityUtils::generateKeyPair(uint8_t* privateKey, uint8_t* publicKey) {
    uECC_set_rng(&getRng);
    
    return uECC_make_key(publicKey, privateKey, uECC_secp160r1()) == 1;
}

bool SecurityUtils::computeSharedSecret(const uint8_t* theirPublicKey, 
                                       const uint8_t* myPrivateKey, 
                                       uint8_t* sharedSecret) {
    return uECC_shared_secret(theirPublicKey, myPrivateKey, sharedSecret, uECC_secp160r1()) == 1;
}

void SecurityUtils::deriveSessionKey(const uint8_t* sharedSecret, uint8_t* sessionKey) {
    // XOR fold 20-byte shared secret to 16-byte session key
    for (int i = 0; i < 16; i++) {
        sessionKey[i] = sharedSecret[i] ^ sharedSecret[(i + 4) % 20];
    }
}

void SecurityUtils::computeHMAC(const uint8_t* key, size_t keyLen, 
                               const uint8_t* data, size_t dataLen, 
                               uint8_t* hmac) {
    SHA256 sha256;
    
    // HMAC = SHA256((key XOR opad) || SHA256((key XOR ipad) || message))
    uint8_t ipad[64];
    uint8_t opad[64];
    uint8_t keyBlock[64];
    
    // Prepare key block (pad or hash if needed)
    memset(keyBlock, 0, 64);
    if (keyLen <= 64) {
        memcpy(keyBlock, key, keyLen);
    } else {
        sha256.reset();
        sha256.update(key, keyLen);
        sha256.finalize(keyBlock, 32);
    }
    
    // Create ipad and opad
    for (int i = 0; i < 64; i++) {
        ipad[i] = keyBlock[i] ^ 0x36;
        opad[i] = keyBlock[i] ^ 0x5C;
    }
    
    // Inner hash: SHA256((key XOR ipad) || message)
    uint8_t innerHash[32];
    sha256.reset();
    sha256.update(ipad, 64);
    sha256.update(data, dataLen);
    sha256.finalize(innerHash, 32);
    
    // Outer hash: SHA256((key XOR opad) || innerHash)
    sha256.reset();
    sha256.update(opad, 64);
    sha256.update(innerHash, 32);
    sha256.finalize(hmac, 32);
}

bool SecurityUtils::verifyHMAC(const uint8_t* key, size_t keyLen, 
                               const uint8_t* data, size_t dataLen, 
                               const uint8_t* receivedHmac) {
    uint8_t computedHmac[32];
    computeHMAC(key, keyLen, data, dataLen, computedHmac);
    
    // Constant-time comparison to prevent timing attacks
    uint8_t result = 0;
    for (int i = 0; i < 32; i++) {
        result |= computedHmac[i] ^ receivedHmac[i];
    }
    
    return result == 0;
}
