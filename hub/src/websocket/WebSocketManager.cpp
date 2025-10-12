#include "WebSocketManager.h"

// Static instance pointer for callback
WebSocketManager* WebSocketManager::instance = nullptr;

WebSocketManager::WebSocketManager() {
    client = nullptr;
    tlsClient = nullptr;
    logger = nullptr;
    storage = nullptr;
    secureMsg = nullptr;
    isConnected = false;
    isAuthenticated = false;
    serverHost = "";
    serverPort = SERVER_PORT;
    serverPath = WEBSOCKET_PATH;
    instance = this;
}

WebSocketManager::~WebSocketManager() {
    if (client) {
        delete client;
    }
    if (tlsClient) {
        delete tlsClient;
    }
    instance = nullptr;
}

void WebSocketManager::begin(Logger* loggerInstance, StorageManager* storageInstance,
                             SecureMessage* secureMessage) {
    logger = loggerInstance;
    storage = storageInstance;
    secureMsg = secureMessage;
    
    if (!WEBSOCKET_ENABLED) {
        if (logger) logger->info("WebSocket is disabled");
        return;
    }
    
    client = new WebSocketsClient();
    
    // Set event handler
    client->onEvent(staticWebSocketEvent);
    
    // Configure reconnect interval
    client->setReconnectInterval(WEBSOCKET_RECONNECT_INTERVAL);
    client->enableHeartbeat(WEBSOCKET_HEARTBEAT_INTERVAL, 
                           WEBSOCKET_HEARTBEAT_TIMEOUT, 
                           WEBSOCKET_HEARTBEAT_RETRIES);
    
    if (logger) logger->info("WebSocket client initialized");
}

void WebSocketManager::staticWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    if (instance) {
        instance->onWebSocketEvent(type, payload, length);
    }
}

void WebSocketManager::onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    if (logger) {
        logger->debug("WS Event: " + String(type));
    }
    
    switch (type) {
        case WStype_DISCONNECTED:
            if (logger) logger->warning("WebSocket disconnected");
            isConnected = false;
            isAuthenticated = false;
            if (secureMsg) secureMsg->clearSessionKey();
            break;
            
        case WStype_CONNECTED:
            if (logger) logger->info("WebSocket connected: " + String((char*)payload));
            isConnected = true;
            sendTimestamp();
            // Check if device is already adopted
            if (storage && storage->isAdopted()) {
                sendSession();
            } else {
                sendHello();
            }
            break;
            
        case WStype_TEXT:
        case WStype_BIN: {
            // Use a smaller buffer for most messages
            DynamicJsonDocument doc(2048);
            DeserializationError error = deserializeJson(doc, (const char*)payload, length);
            
            if (error) {
                if (logger) logger->error("JSON parse error: " + String(error.c_str()));
                return;
            }
            
            const char* type = doc["type"] | "";
            if (logger) logger->debug("Message type: " + String(type));

            if (strcmp(type, "timestamp_ack") == 0) {
                handleTimestampAck(doc);
                return;
            }

            if (strcmp(type, "hello_ack") == 0) {
                handleHelloAck(doc);
                return;
            }
            
            if (strcmp(type, "session_ack") == 0) {
                handleSessionAck(doc);
                return;
            }

            uint32_t ts = doc["ts"].as<uint32_t>();
            if (ts > 0) {
                secureMsg->setServerTime(ts);
            }
            
            if (strcmp(type, "adopt_ack") == 0) {
                handleAdoptAck(doc);
                return;
            }
            break;
        }
            
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

void WebSocketManager::handleTimestampAck(JsonDocument& doc) {
    logger->info("Processing TIMESTAMP_ACK...");

    uint32_t ts = doc["ts"].as<uint32_t>();
    secureMsg->setServerTime(ts);

    logger->info("Server time set to: " + String(ts));
}

void WebSocketManager::handleHelloAck(JsonDocument& doc) {
    if (logger) logger->info("Processing HELLO_ACK...");
    
    // Extract IKM and KDF parameters
    String ikmB64 = doc["ikm"].as<String>();
    String saltB64 = doc["kdf"]["salt"].as<String>();
    const char* info = doc["kdf"]["info"];
    
    uint8_t ikm[32], salt[16], sessionKey[32];
    CryptoManager::base64Decode(ikmB64, ikm, sizeof(ikm));
    CryptoManager::base64Decode(saltB64, salt, sizeof(salt));
    
    // Derive session key using HKDF
    size_t infoLen = strlen(info);
    if (!CryptoManager::hkdfSha256(ikm, 32, salt, 16, 
                                   (const uint8_t*)info, infoLen, sessionKey)) {
        if (logger) logger->error("HKDF failed");
        return;
    }
    
    // Set session key
    if (secureMsg) {
        secureMsg->setSessionKey(sessionKey);
        secureMsg->setServerTime(doc["ts"].as<uint32_t>());
        secureMsg->setSeqOut(doc["seq0"].as<uint32_t>());
    }
    
    if (logger) logger->info("Session key derived successfully");
    
    // Send hello_ack
    sendHelloAck();
}

void WebSocketManager::handleSessionAck(JsonDocument& doc) {
    if (logger) logger->info("Processing SESSION_ACK...");
    
    // Extract IKM and KDF parameters
    String ikmB64 = doc["ikm"].as<String>();
    String saltB64 = doc["kdf"]["salt"].as<String>();
    const char* info = doc["kdf"]["info"];
    
    uint8_t ikm[32], salt[16], sessionKey[32];
    CryptoManager::base64Decode(ikmB64, ikm, sizeof(ikm));
    CryptoManager::base64Decode(saltB64, salt, sizeof(salt));
    
    // Derive session key using HKDF
    size_t infoLen = strlen(info);
    if (!CryptoManager::hkdfSha256(ikm, 32, salt, 16, 
                                   (const uint8_t*)info, infoLen, sessionKey)) {
        if (logger) logger->error("HKDF failed");
        return;
    }
    
    // Set session key
    if (secureMsg) {
        secureMsg->setSessionKey(sessionKey);
        secureMsg->setServerTime(doc["ts"].as<uint32_t>());
        secureMsg->setSeqOut(doc["seq0"].as<uint32_t>());
    }
    
    if (logger) logger->info("Session key derived successfully");
    
    // Send session_ack (protocol response)
    sendSessionAck();
    
    // For already adopted devices, directly set authenticated
    if (storage && storage->isAdopted()) {
        isAuthenticated = true;
        if (logger) logger->info("Session restored - device already adopted");
    }
}

void WebSocketManager::handleAdoptAck(JsonDocument& doc) {
    if (logger) logger->info("Processing ADOPT_ACK...");
    
    // Verify the message
    if (secureMsg && secureMsg->verifyMessage(doc, MAX_TIME_DRIFT)) {
        isAuthenticated = true;
        
        // Mark device as adopted
        if (storage && !storage->isAdopted()) {
            storage->setAdopted(true);
            if (logger) logger->info("Device marked as adopted");
        }
        
        if (logger) logger->info("Device authenticated successfully!");
    } else {
        if (logger) logger->error("ADOPT_ACK verification failed");
    }
}

void WebSocketManager::sendTimestamp() {
    client->sendTXT("{\"type\":\"timestamp\"}");
    logger->info("TIMESTAMP sent");
}

void WebSocketManager::sendHello() {
    if (!storage) return;
    
    String devPriv = storage->getDevicePrivateKey();
    String devPub = storage->getDevicePublicKey();
    
    if (devPriv.length() == 0 || devPub.length() == 0) {
        if (logger) logger->error("No device keys for HELLO");
        return;
    }
    
    // Generate nonce
    String nonceB64 = secureMsg ? secureMsg->generateNonce(12) : "";
    if (nonceB64.length() == 0) {
        if (logger) logger->error("Failed to generate nonce");
        return;
    }
    
    uint32_t ts = secureMsg ? secureMsg->getCurrentTime() : (millis() / 1000);
    
    // Decode nonce for digest calculation
    uint8_t nonce[12];
    CryptoManager::base64Decode(nonceB64, nonce, sizeof(nonce));
    
    // Create digest: SHA256(device_id || ts || nonce)
    String s = String(DEVICE_ID) + String(ts);
    size_t totalLen = s.length() + sizeof(nonce);
    uint8_t* buf = (uint8_t*)malloc(totalLen);
    memcpy(buf, s.c_str(), s.length());
    memcpy(buf + s.length(), nonce, sizeof(nonce));
    
    uint8_t digest[32];
    CryptoManager::sha256(buf, totalLen, digest);
    free(buf);
    
    // Sign the digest
    String sigB64;
    if (!CryptoManager::signSha256(devPriv, digest, sigB64)) {
        if (logger) logger->error("Signing failed");
        return;
    }
    
    // Build HELLO message
    DynamicJsonDocument doc(2048);
    doc["type"] = "hello";
    doc["device_id"] = DEVICE_ID;
    doc["ts"] = ts;
    doc["nonce"] = nonceB64;
    doc["sig"] = sigB64;
    doc["pubkey_pem"] = devPub;
    
    String out;
    serializeJson(doc, out);
    client->sendTXT(out);
    
    if (logger) logger->info("HELLO sent");
}

void WebSocketManager::sendSession() {
    if (!storage) return;
    
    String devPriv = storage->getDevicePrivateKey();
    
    if (devPriv.length() == 0) {
        if (logger) logger->error("No device keys for SESSION");
        return;
    }
    
    // Generate nonce
    String nonceB64 = secureMsg ? secureMsg->generateNonce(12) : "";
    if (nonceB64.length() == 0) {
        if (logger) logger->error("Failed to generate nonce");
        return;
    }
    
    uint32_t ts = secureMsg ? secureMsg->getCurrentTime() : (millis() / 1000);
    
    // Decode nonce for digest calculation
    uint8_t nonce[12];
    CryptoManager::base64Decode(nonceB64, nonce, sizeof(nonce));
    
    // Create digest: SHA256(device_id || ts || nonce)
    String s = String(DEVICE_ID) + String(ts);
    size_t totalLen = s.length() + sizeof(nonce);
    uint8_t* buf = (uint8_t*)malloc(totalLen);
    memcpy(buf, s.c_str(), s.length());
    memcpy(buf + s.length(), nonce, sizeof(nonce));
    
    uint8_t digest[32];
    CryptoManager::sha256(buf, totalLen, digest);
    free(buf);
    
    // Sign the digest
    String sigB64;
    if (!CryptoManager::signSha256(devPriv, digest, sigB64)) {
        if (logger) logger->error("Signing failed");
        return;
    }
    
    // Build SESSION message (same as HELLO but without pubkey_pem)
    DynamicJsonDocument doc(2048);
    doc["type"] = "session";
    doc["device_id"] = DEVICE_ID;
    doc["ts"] = ts;
    doc["nonce"] = nonceB64;
    doc["sig"] = sigB64;
    
    String out;
    serializeJson(doc, out);
    client->sendTXT(out);
    
    if (logger) logger->info("SESSION sent");
}

void WebSocketManager::sendHelloAck() {
    if (!secureMsg) return;
    
    String msg = secureMsg->createSimpleMessage("hello_ack");
    if (msg.length() > 0) {
        client->sendTXT(msg);
        if (logger) logger->info("HELLO_ACK sent");
    }
}

void WebSocketManager::sendSessionAck() {
    if (!secureMsg) return;
    
    String msg = secureMsg->createSimpleMessage("session_ack");
    if (msg.length() > 0) {
        client->sendTXT(msg);
        if (logger) logger->info("SESSION_ACK sent");
    }
}

void WebSocketManager::setServer(String host, uint16_t port, String path, bool useTLS) {
    serverHost = host;
    serverPort = port;
    serverPath = path;
}

bool WebSocketManager::connect() {
    if (!WEBSOCKET_ENABLED || !client) return false;
    
    if (logger) {
        logger->info("Connecting to WebSocket: " + serverHost + ":" + 
                    String(serverPort) + serverPath);
    }
    
    // Set up TLS if enabled
    if (SERVER_USE_TLS && storage) {
        String cert = storage->getServerCertificate();
        if (cert.length() > 0) {
            tlsClient = new WiFiClientSecure();
            tlsClient->setCACert(cert.c_str());
            client->beginSSL(serverHost, serverPort, serverPath);
        } else {
            if (logger) logger->warning("No server cert, using insecure connection");
            client->begin(serverHost, serverPort, serverPath);
        }
    } else {
        client->begin(serverHost, serverPort, serverPath);
    }
    
    return true;
}

void WebSocketManager::disconnect() {
    if (client) {
        client->disconnect();
        isConnected = false;
        isAuthenticated = false;
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

bool WebSocketManager::isAuth() {
    return isAuthenticated;
}

bool WebSocketManager::sendTelemetry(JsonDocument& payload) {
    if (!isAuthenticated || !secureMsg) return false;
    
    String msg = secureMsg->createAuthenticatedMessage("telemetry", payload);
    if (msg.length() > 0) {
        client->sendTXT(msg);
        if (logger) logger->debug("Telemetry sent");
        return true;
    }
    return false;
}

bool WebSocketManager::sendMessage(const char* type, JsonDocument& payload) {
    if (!isAuthenticated || !secureMsg) return false;
    
    String msg = secureMsg->createAuthenticatedMessage(type, payload);
    if (msg.length() > 0) {
        client->sendTXT(msg);
        if (logger) logger->debug("Message sent: " + String(type));
        return true;
    }
    return false;
}
