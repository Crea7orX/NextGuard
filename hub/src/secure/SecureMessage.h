#ifndef SECURE_MESSAGE_H
#define SECURE_MESSAGE_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <crypto/CryptoManager.h>
#include <logger/Logger.h>

class SecureMessage {
private:
    Logger* logger;
    uint8_t sessionKey[32];
    uint32_t seqOut;
    uint32_t srvLastSeq;
    uint32_t lastServerTime;
    uint32_t bootMillis;
    bool hasSessionKey;

public:
    SecureMessage();
    
    void begin(Logger* loggerInstance);
    
    // Session key management
    void setSessionKey(const uint8_t key[32]);
    bool hasValidSessionKey();
    void clearSessionKey();
    
    // Sequence number management
    uint32_t getNextSeqOut();
    void setSeqOut(uint32_t seq);
    uint32_t getLastServerSeq();
    bool checkServerSeq(uint32_t seq);
    
    // Time management
    void setServerTime(uint32_t ts);
    uint32_t getCurrentTime();
    
    // Message creation
    String createAuthenticatedMessage(const char* type, JsonDocument& payload);
    String createSimpleMessage(const char* type);
    
    // Message verification
    bool verifyMessage(JsonDocument& doc, uint32_t maxTimeDrift = 120);
    
    // Helper: Create message pack string (for HMAC)
    String createMessagePack(const char* type, uint32_t seq, uint32_t ts, 
                            const String& nonce, const String& payloadStr = "");
    
    // Generate random nonce
    String generateNonce(size_t len = 12);
};

#endif // SECURE_MESSAGE_H
