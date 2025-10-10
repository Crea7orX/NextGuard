#include "CryptoManager.h"
#include "mbedtls/pk.h"
#include "mbedtls/ctr_drbg.h"
#include "mbedtls/entropy.h"
#include "mbedtls/sha256.h"
#include "mbedtls/md.h"
#include "mbedtls/base64.h"
#include "mbedtls/ecdsa.h"
#include "esp_system.h"

CryptoManager::CryptoManager() {
}

String CryptoManager::base64Encode(const uint8_t* data, size_t len) {
    size_t olen = 0;
    mbedtls_base64_encode(NULL, 0, &olen, data, len);
    
    unsigned char* out = (unsigned char*)malloc(olen + 1);
    if (!out) return "";
    
    mbedtls_base64_encode(out, olen, &olen, data, len);
    out[olen] = 0;
    
    String s((char*)out);
    free(out);
    return s;
}

size_t CryptoManager::base64Decode(const String& str, uint8_t* out, size_t outlen) {
    size_t olen = 0;
    mbedtls_base64_decode(out, outlen, &olen, 
                         (const unsigned char*)str.c_str(), str.length());
    return olen;
}

void CryptoManager::randomBytes(uint8_t* out, size_t len) {
    for (size_t i = 0; i < len; i++) {
        out[i] = (uint8_t)esp_random();
    }
}

bool CryptoManager::hmacSha256(const uint8_t* key, size_t keylen, 
                               const uint8_t* data, size_t datalen, 
                               uint8_t out[32]) {
    const mbedtls_md_info_t* md = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
    if (!md) return false;
    return mbedtls_md_hmac(md, key, keylen, data, datalen, out) == 0;
}

bool CryptoManager::hkdfSha256(const uint8_t* ikm, size_t ikmLen,
                               const uint8_t* salt, size_t saltLen,
                               const uint8_t* info, size_t infoLen,
                               uint8_t out[32]) {
    // HKDF-Extract
    uint8_t prk[32];
    if (!hmacSha256(salt, saltLen, ikm, ikmLen, prk)) {
        return false;
    }
    
    // HKDF-Expand (one block)
    size_t bufLen = infoLen + 1;
    uint8_t* buf = (uint8_t*)malloc(bufLen);
    if (!buf) return false;
    
    memcpy(buf, info, infoLen);
    buf[infoLen] = 0x01;
    
    bool ok = hmacSha256(prk, 32, buf, bufLen, out);
    free(buf);
    return ok;
}

bool CryptoManager::sha256(const uint8_t* data, size_t len, uint8_t out[32]) {
    // Use ESP32's hardware-accelerated SHA256 if available
    mbedtls_sha256_context ctx;
    mbedtls_sha256_init(&ctx);
    mbedtls_sha256_starts(&ctx, 0);
    mbedtls_sha256_update(&ctx, data, len);
    mbedtls_sha256_finish(&ctx, out);
    mbedtls_sha256_free(&ctx);
    return true;
}

bool CryptoManager::generateECDSAKeyPair(String& outPrivPem, String& outPubPem) {
    mbedtls_pk_context pk;
    mbedtls_pk_init(&pk);
    
    mbedtls_entropy_context entropy;
    mbedtls_entropy_init(&entropy);
    
    mbedtls_ctr_drbg_context ctr;
    mbedtls_ctr_drbg_init(&ctr);
    
    const char* pers = "esp32-ecdsa";
    if (mbedtls_ctr_drbg_seed(&ctr, mbedtls_entropy_func, &entropy, 
                               (const unsigned char*)pers, strlen(pers)) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }
    
    if (mbedtls_pk_setup(&pk, mbedtls_pk_info_from_type(MBEDTLS_PK_ECKEY)) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }
    
    if (mbedtls_ecp_gen_key(MBEDTLS_ECP_DP_SECP256R1, mbedtls_pk_ec(pk), 
                            mbedtls_ctr_drbg_random, &ctr) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }

    // Write private key
    unsigned char priv[2000];
    if (mbedtls_pk_write_key_pem(&pk, priv, sizeof(priv)) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }
    outPrivPem = String((char*)priv);

    // Write public key
    unsigned char pub[2000];
    if (mbedtls_pk_write_pubkey_pem(&pk, pub, sizeof(pub)) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }
    outPubPem = String((char*)pub);

    mbedtls_pk_free(&pk);
    mbedtls_ctr_drbg_free(&ctr);
    mbedtls_entropy_free(&entropy);
    return true;
}

bool CryptoManager::signSha256(const String& privPem, const uint8_t digest[32], String& sigB64) {
    mbedtls_pk_context pk;
    mbedtls_pk_init(&pk);
    
    if (mbedtls_pk_parse_key(&pk, (const unsigned char*)privPem.c_str(), 
                             privPem.length() + 1, NULL, 0) != 0) {
        mbedtls_pk_free(&pk);
        return false;
    }
    
    mbedtls_entropy_context entropy;
    mbedtls_entropy_init(&entropy);
    
    mbedtls_ctr_drbg_context ctr;
    mbedtls_ctr_drbg_init(&ctr);
    
    const char* pers = "esp32-signer";
    if (mbedtls_ctr_drbg_seed(&ctr, mbedtls_entropy_func, &entropy, 
                               (const unsigned char*)pers, strlen(pers)) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }
    
    unsigned char sig[200];
    size_t sigLen = 0;
    if (mbedtls_pk_sign(&pk, MBEDTLS_MD_SHA256, digest, 0, sig, &sigLen, 
                        mbedtls_ctr_drbg_random, &ctr) != 0) {
        mbedtls_pk_free(&pk);
        mbedtls_ctr_drbg_free(&ctr);
        mbedtls_entropy_free(&entropy);
        return false;
    }
    
    sigB64 = base64Encode(sig, sigLen);
    
    mbedtls_pk_free(&pk);
    mbedtls_ctr_drbg_free(&ctr);
    mbedtls_entropy_free(&entropy);
    return true;
}

bool CryptoManager::verifySha256(const String& pubPem, const uint8_t digest[32], const String& sigB64) {
    mbedtls_pk_context pk;
    mbedtls_pk_init(&pk);
    
    if (mbedtls_pk_parse_public_key(&pk, (const unsigned char*)pubPem.c_str(), 
                                     pubPem.length() + 1) != 0) {
        mbedtls_pk_free(&pk);
        return false;
    }
    
    uint8_t sig[200];
    size_t sigLen = base64Decode(sigB64, sig, sizeof(sig));
    
    int ret = mbedtls_pk_verify(&pk, MBEDTLS_MD_SHA256, digest, 0, sig, sigLen);
    
    mbedtls_pk_free(&pk);
    return ret == 0;
}
