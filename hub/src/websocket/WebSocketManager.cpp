#include "WebSocketManager.h"

// Static instance pointer for callback
WebSocketManager* WebSocketManager::instance = nullptr;

WebSocketManager::WebSocketManager() {
    client = nullptr;
    logger = nullptr;
    isConnected = false;
    lastReconnectAttempt = 0;
    serverHost = "";
    serverPort = WEBSOCKET_PORT;
    serverPath = WEBSOCKET_PATH;
    instance = this;
}

WebSocketManager::~WebSocketManager() {
    if (client) {
        delete client;
    }
    instance = nullptr;
}

void WebSocketManager::begin(Logger* loggerInstance) {
    logger = loggerInstance;
    
    if (!WEBSOCKET_ENABLED) {
        if (logger) logger->info("WebSocket is disabled");
        return;
    }
    
    client = new WebSocketsClient();
    
    // Parse server URL from config
    String serverURL = String(WEBSOCKET_SERVER);
    
    // Simple URL parsing (ws://host:port or ws://host)
    if (serverURL.startsWith("ws://")) {
        serverURL = serverURL.substring(5); // Remove "ws://"
    } else if (serverURL.startsWith("wss://")) {
        serverURL = serverURL.substring(6); // Remove "wss://"
    }
    
    int colonPos = serverURL.indexOf(':');
    int slashPos = serverURL.indexOf('/');
    
    if (colonPos > 0) {
        serverHost = serverURL.substring(0, colonPos);
        if (slashPos > colonPos) {
            serverPort = serverURL.substring(colonPos + 1, slashPos).toInt();
            serverPath = serverURL.substring(slashPos);
        } else {
            serverPort = serverURL.substring(colonPos + 1).toInt();
        }
    } else if (slashPos > 0) {
        serverHost = serverURL.substring(0, slashPos);
        serverPath = serverURL.substring(slashPos);
    } else {
        serverHost = serverURL;
    }
    
    // Set event handler
    client->onEvent(staticWebSocketEvent);
    
    // Configure reconnect interval
    client->setReconnectInterval(WEBSOCKET_RECONNECT_INTERVAL);
    
    if (logger) logger->info("WebSocket client initialized");
}

void WebSocketManager::staticWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    if (instance) {
        instance->onWebSocketEvent(type, payload, length);
    }
}

void WebSocketManager::onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            if (logger) logger->warning("WebSocket disconnected");
            isConnected = false;
            break;
            
        case WStype_CONNECTED:
            if (logger) {
                logger->info("WebSocket connected to: " + String((char*)payload));
            }
            isConnected = true;
            break;
            
        case WStype_TEXT:
            if (logger) {
                logger->debug("WebSocket message received: " + String((char*)payload));
            }
            // Handle incoming text message
            // You can parse JSON here and handle different message types
            break;
            
        case WStype_BIN:
            if (logger) {
                logger->debug("WebSocket binary data received: " + String(length) + " bytes");
            }
            // Handle incoming binary data
            break;
            
        case WStype_ERROR:
            if (logger) logger->error("WebSocket error");
            break;
            
        case WStype_PING:
            if (logger) logger->debug("WebSocket ping");
            break;
            
        case WStype_PONG:
            if (logger) logger->debug("WebSocket pong");
            break;
            
        default:
            break;
    }
}

void WebSocketManager::setServer(String host, uint16_t port, String path) {
    serverHost = host;
    serverPort = port;
    serverPath = path;
}

bool WebSocketManager::connect() {
    if (!WEBSOCKET_ENABLED || !client) return false;
    
    if (logger) {
        logger->info("Connecting to WebSocket: " + serverHost + ":" + String(serverPort) + serverPath);
    }
    
    client->begin(serverHost, serverPort, serverPath);
    return true;
}

void WebSocketManager::disconnect() {
    if (client) {
        client->disconnect();
        isConnected = false;
        if (logger) logger->info("WebSocket disconnected");
    }
}

void WebSocketManager::loop() {
    if (!WEBSOCKET_ENABLED || !client) return;
    
    client->loop();
}

bool WebSocketManager::isWebSocketConnected() {
    return isConnected;
}

bool WebSocketManager::sendText(String message) {
    if (!isConnected || !client) return false;
    
    client->sendTXT(message);
    if (logger) logger->debug("WebSocket sent: " + message);
    return true;
}

bool WebSocketManager::sendJSON(JsonDocument& doc) {
    if (!isConnected || !client) return false;
    
    String output;
    serializeJson(doc, output);
    
    return sendText(output);
}

bool WebSocketManager::sendBinary(uint8_t* data, size_t length) {
    if (!isConnected || !client) return false;
    
    client->sendBIN(data, length);
    if (logger) logger->debug("WebSocket sent binary: " + String(length) + " bytes");
    return true;
}
