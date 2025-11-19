#ifndef WEBSOCKET_MANAGER_H
#define WEBSOCKET_MANAGER_H

#include <Arduino.h>
#include <WebSocketsClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <config/Config.h>
#include <logger/Logger.h>
#include <storage/StorageManager.h>
#include <crypto/CryptoManager.h>
#include <secure/SecureMessage.h>
#include <node/NodeManager.h>
#include <utils/Utils.h>

// Forward declaration to avoid circular dependency
class LoRaManager;

class WebSocketManager {
private:
    WebSocketsClient* client;
    WiFiClientSecure* tlsClient;
    Logger* logger;
    StorageManager* storage;
    SecureMessage* secureMsg;
    LoRaManager* loRaManager;
    NodeManager* nodeManager;
    bool isConnected;
    bool isAuthenticated;
    String serverHost;
    uint16_t serverPort;
    String serverPath;
    static WebSocketManager* instance;
    void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    static void staticWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    void handleTimestampAck(JsonDocument& doc);
    void handleHelloAck(JsonDocument& doc);
    void handleSessionAck(JsonDocument& doc);
    void handleAdoptAck(JsonDocument& doc);
    void handleDiscoveryAck(JsonDocument& doc);
    void handleWsEnableNodeAdoption(JsonDocument& doc);
    void handleWsSendMessageToNode(JsonDocument& doc);
    void sendTimestamp();
    void sendHello();
    void sendSession();
    void sendHelloAck();
    void sendSessionAck();

public:
    WebSocketManager();
    ~WebSocketManager();
    
    void begin(Logger* loggerInstance, StorageManager* storageInstance,
               SecureMessage* secureMessage, LoRaManager* loRaManagerInstance,
               NodeManager* nodeManagerInstance);
    void loop();
    bool connect();
    void disconnect();
    bool isWebSocketConnected();
    bool isAuth();
    bool sendTelemetry(JsonDocument& payload);
    bool sendMessage(const char* type, JsonDocument& payload);
    void setServer(String host, uint16_t port, String path, bool useTLS = true);
};

#endif // WEBSOCKET_MANAGER_H
