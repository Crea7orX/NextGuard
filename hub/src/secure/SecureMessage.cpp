#include "SecureMessage.h"
#include <storage/StorageManager.h>

SecureMessage::SecureMessage() {
    logger = nullptr;
    storage = nullptr;
    seqOut = 1;
    srvLastSeq = 0;
    lastServerTime = 0;
    bootMillis = millis();
    hasSessionKey = false;
    memset(sessionKey, 0, sizeof(sessionKey));
}

void SecureMessage::begin(Logger* loggerInstance, StorageManager* storageInstance) {
    logger = loggerInstance;
    storage = storageInstance;
}

void SecureMessage::setSessionKey(const uint8_t key[32]) {
    memcpy(sessionKey, key, 32);
    hasSessionKey = true;
    if (logger) logger->info("Session key set");
}

bool SecureMessage::hasValidSessionKey() {
    return hasSessionKey;
}

void SecureMessage::clearSessionKey() {
    memset(sessionKey, 0, sizeof(sessionKey));
    hasSessionKey = false;
    seqOut = 1;
    srvLastSeq = 0;
}

uint32_t SecureMessage::getNextSeqOut() {
    return seqOut++;
}

void SecureMessage::setSeqOut(uint32_t seq) {
    seqOut = seq;
}

uint32_t SecureMessage::getLastServerSeq() {
    return srvLastSeq;
}

bool SecureMessage::checkServerSeq(uint32_t seq) {
    if (seq <= srvLastSeq) {
        if (logger) logger->warning("Out-of-order seq from server");
        return false;
    }
    srvLastSeq = seq;
    return true;
}

void SecureMessage::setServerTime(uint32_t ts) {
    lastServerTime = ts;
    bootMillis = millis();
}

uint32_t SecureMessage::getCurrentTime() {
    if (lastServerTime == 0) {
        return (millis() / 1000) + 1;
    }
    return lastServerTime + ((millis() - bootMillis) / 1000);
}

String SecureMessage::generateNonce(size_t len) {
    uint8_t nonce[16];
    if (len > sizeof(nonce)) len = sizeof(nonce);
    CryptoManager::randomBytes(nonce, len);
    return CryptoManager::base64Encode(nonce, len);
}

String SecureMessage::createMessagePack(const char* type, uint32_t seq, uint32_t ts,
                                       const String& nonce, const String& payloadStr) {
    String pack = String("{\"type\":\"") + type + "\",\"seq\":" + seq + 
                 ",\"ts\":" + ts + ",\"nonce\":\"" + nonce + "\"";
    
    if (payloadStr.length() > 0) {
        pack += ",\"payload\":" + payloadStr;
    }
    
    pack += "}";
    return pack;
}

String SecureMessage::createAuthenticatedMessage(const char* type, JsonDocument& payload) {
    if (!hasSessionKey) {
        if (logger) logger->error("No session key for authenticated message");
        return "";
    }
    
    String nonceB64 = generateNonce(12);
    uint32_t ts = getCurrentTime();
    uint32_t seq = getNextSeqOut();
    
    // Serialize payload
    String payloadStr;
    serializeJson(payload, payloadStr);
    
    // Create pack string
    String pack = createMessagePack(type, seq, ts, nonceB64, payloadStr);
    
    // Calculate HMAC
    uint8_t mac[32];
    CryptoManager::hmacSha256(sessionKey, 32, 
                              (const uint8_t*)pack.c_str(), pack.length(), mac);
    String macB64 = CryptoManager::base64Encode(mac, 32);
    
    // Build final message
    StaticJsonDocument<1024> frame;
    frame["type"] = type;
    frame["seq"] = (int)seq;
    frame["ts"] = ts;
    frame["nonce"] = nonceB64;
    frame["payload"] = serialized(payloadStr);
    frame["mac"] = macB64;
    
    String out;
    serializeJson(frame, out);
    return out;
}

String SecureMessage::createSimpleMessage(const char* type) {
    if (!hasSessionKey) {
        if (logger) logger->error("No session key for simple message");
        return "";
    }
    
    String nonceB64 = generateNonce(12);
    uint32_t ts = getCurrentTime();
    uint32_t seq = getNextSeqOut();
    
    // Create pack string (no payload)
    String pack = createMessagePack(type, seq, ts, nonceB64);
    
    // Calculate HMAC
    uint8_t mac[32];
    CryptoManager::hmacSha256(sessionKey, 32,
                              (const uint8_t*)pack.c_str(), pack.length(), mac);
    String macB64 = CryptoManager::base64Encode(mac, 32);
    
    // Build final message
    StaticJsonDocument<512> frame;
    frame["type"] = type;
    frame["seq"] = (int)seq;
    frame["ts"] = ts;
    frame["nonce"] = nonceB64;
    frame["mac"] = macB64;
    
    String out;
    serializeJson(frame, out);
    return out;
}

bool SecureMessage::checkTimeDrift(JsonDocument& doc, uint32_t maxTimeDrift) {
    uint32_t ts = doc["ts"].as<uint32_t>();
    uint32_t nowT = getCurrentTime();
    int64_t drift = (int64_t)nowT - (int64_t)ts;
    if (abs((int)drift) > (int)maxTimeDrift) {
        logger->warning("Message timestamp drift too large");
        return false;
    }
    return true;
}

bool SecureMessage::verifyMessage(JsonDocument& doc) {
    if (!hasSessionKey) {
        if (logger) logger->error("No session key for verification");
        return false;
    }
    
    // Extract fields
    const char* type = doc["type"];
    uint32_t seq = doc["seq"].as<uint32_t>();
    uint32_t ts = doc["ts"].as<uint32_t>();
    String nonce = doc["nonce"].as<String>();
    String receivedMac = doc["mac"].as<String>();
    
    // Recreate pack string
    String payloadStr;
    if (doc.containsKey("payload")) {
        serializeJson(doc["payload"], payloadStr);
    }
    
    String pack = createMessagePack(type, seq, ts, nonce, payloadStr);
    
    // Calculate expected MAC
    uint8_t macCalc[32];
    CryptoManager::hmacSha256(sessionKey, 32,
                              (const uint8_t*)pack.c_str(), pack.length(), macCalc);
    String macB64 = CryptoManager::base64Encode(macCalc, 32);
    
    // Verify MAC
    if (macB64 != receivedMac) {
        if (logger) logger->error("MAC verification failed");
        return false;
    }
    
    // Check time drift
    if (!checkTimeDrift(doc)) {
        return false;
    }
    
    // Check sequence number
    if (!checkServerSeq(seq)) {
        return false;
    }
    
    return true;
}

bool SecureMessage::verifyServerSignature(JsonDocument& doc) {
    String serverSignPubKey = storage->getServerSigningPublicKey();
    if (serverSignPubKey.length() == 0) {
        logger->error("Server signing public key not found");
        return false;
    }

    uint32_t ts = doc["ts"].as<uint32_t>();
    String nonce = doc["nonce"].as<String>();
    String sigB64 = doc["sig"].as<String>();
    
    if (ts == 0 || nonce == "null" || sigB64 == "null") {
        logger->error("Missing required signature fields");
        return false;
    }

    // Create digest: SHA256(ts || nonce)
    String tsStr = String(ts);
    String digestInput = tsStr + nonce;
    
    uint8_t digest[32];
    CryptoManager::sha256((const uint8_t*)digestInput.c_str(), digestInput.length(), digest);
    
    // Verify the signature
    bool verified = CryptoManager::verifySha256(serverSignPubKey, digest, sigB64);
    
    if (!verified) {
        logger->error("Server signature verification failed!");
    }
    
    return verified;
}
