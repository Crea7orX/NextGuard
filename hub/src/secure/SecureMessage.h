#ifndef SECURE_MESSAGE_H
#define SECURE_MESSAGE_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <crypto/CryptoManager.h>
#include <logger/Logger.h>
#include <storage/StorageManager.h>

class SecureMessage {
private:
    Logger* logger;
    StorageManager* storage;
    uint8_t sessionKey[32];
    uint32_t seqOut;
    uint32_t srvLastSeq;
    uint32_t lastServerTime;
    uint32_t bootMillis;
    bool hasSessionKey;

public:
    SecureMessage();
    
    void begin(Logger* loggerInstance, StorageManager* storageInstance);
    void setSessionKey(const uint8_t key[32]);
    bool hasValidSessionKey();
    void clearSessionKey();
    uint32_t getNextSeqOut();
    void setSeqOut(uint32_t seq);
    uint32_t getLastServerSeq();
    bool checkServerSeq(uint32_t seq);
    void setServerTime(uint32_t ts);
    uint32_t getCurrentTime();
    String createAuthenticatedMessage(const char* type, JsonDocument& payload);
    String createSimpleMessage(const char* type);
    bool checkTimeDrift(JsonDocument& doc, uint32_t maxTimeDrift = MAX_TIME_DRIFT);
    bool verifyMessage(JsonDocument& doc);
    bool verifyServerSignature(JsonDocument& doc);
    String createMessagePack(const char* type, uint32_t seq, uint32_t ts, 
                            const String& nonce, const String& payloadStr = "");
    String generateNonce(size_t len = 12);
};

#endif // SECURE_MESSAGE_H
