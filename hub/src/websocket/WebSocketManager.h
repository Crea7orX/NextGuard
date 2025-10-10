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

class WebSocketManager {
private:
    WebSocketsClient* client;
    WiFiClientSecure* tlsClient;
    Logger* logger;
    StorageManager* storage;
    SecureMessage* secureMsg;
    
    bool isConnected;
    bool isAuthenticated;
    String serverHost;
    uint16_t serverPort;
    String serverPath;
    
    // Static instance for callback
    static WebSocketManager* instance;
    
    // WebSocket event handler
    void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    static void staticWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    
    // Protocol message handlers
    void handleHelloAck(JsonDocument& doc);
    void handleSessionAck(JsonDocument& doc);
    void handleAdoptAck(JsonDocument& doc);
    void handleCommand(JsonDocument& doc);
    void handleTimeSync(JsonDocument& doc);
    void handleAck(JsonDocument& doc);
    
    // Protocol message senders
    void sendHello();
    void sendSession();
    void sendHelloAck();
    void sendSessionAck();

public:
    WebSocketManager();
    ~WebSocketManager();
    
    void begin(Logger* loggerInstance, StorageManager* storageInstance,
               SecureMessage* secureMessage);
    void loop();
    bool connect();
    void disconnect();
    bool isWebSocketConnected();
    bool isAuth();
    
    // Send authenticated messages
    bool sendTelemetry(JsonDocument& payload);
    bool sendMessage(const char* type, JsonDocument& payload);
    
    // Configure server
    void setServer(String host, uint16_t port, String path, bool useTLS = true);
};

#endif // WEBSOCKET_MANAGER_H
