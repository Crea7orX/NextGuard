#ifndef WEBSOCKET_MANAGER_H
#define WEBSOCKET_MANAGER_H

#include <Arduino.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <config/Config.h>
#include <logger/Logger.h>

class WebSocketManager {
private:
    WebSocketsClient* client;
    Logger* logger;
    bool isConnected;
    unsigned long lastReconnectAttempt;
    String serverHost;
    uint16_t serverPort;
    String serverPath;
    
    void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    static void staticWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    static WebSocketManager* instance;

public:
    WebSocketManager();
    ~WebSocketManager();
    
    void begin(Logger* loggerInstance);
    void loop();
    bool connect();
    void disconnect();
    bool isWebSocketConnected();
    
    // Send methods
    bool sendText(String message);
    bool sendJSON(JsonDocument& doc);
    bool sendBinary(uint8_t* data, size_t length);
    
    // Configure server
    void setServer(String host, uint16_t port, String path);
};

#endif // WEBSOCKET_MANAGER_H
