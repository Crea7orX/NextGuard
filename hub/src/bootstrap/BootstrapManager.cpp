#include "BootstrapManager.h"

BootstrapManager::BootstrapManager() {
    logger = nullptr;
    storage = nullptr;
    serverPort = 443;
}

void BootstrapManager::begin(Logger* loggerInstance, StorageManager* storageInstance,
                             const char* host, uint16_t port) {
    logger = loggerInstance;
    storage = storageInstance;
    serverHost = String(host);
    serverPort = port;
}

String BootstrapManager::httpGet(const char* path) {
    WiFiClientSecure client;
    client.setInsecure(); // TOFU: Trust on first use
    
    if (logger) {
        logger->info("Connecting to " + serverHost + ":" + String(serverPort));
    }
    
    if (!client.connect(serverHost.c_str(), serverPort)) {
        if (logger) logger->error("Connection failed!");
        return "";
    }
    
    if (logger) logger->info("Connected, sending GET request");
    
    client.printf("GET %s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n", 
                  path, serverHost.c_str());
    
    String response;
    response.reserve(4096); // Pre-allocate memory to reduce fragmentation
    unsigned long timeout = millis();
    while (client.connected() || client.available()) {
        if (client.available()) {
            response += (char)client.read();
            timeout = millis();
        }
        if (millis() - timeout > 5000) {
            if (logger) logger->warning("HTTP read timeout");
            break;
        }
        delay(1);
    }
    
    client.stop();
    
    // Extract body (after "\r\n\r\n")
    int idx = response.indexOf("\r\n\r\n");
    if (idx < 0) {
        if (logger) logger->error("No HTTP body found");
        return "";
    }
    
    return response.substring(idx + 4);
}

bool BootstrapManager::httpPost(const char* path, const String& jsonBody) {
    WiFiClientSecure client;
    client.setInsecure(); // TOFU: Trust on first use
    
    if (!client.connect(serverHost.c_str(), serverPort)) {
        if (logger) logger->error("Connection failed!");
        return false;
    }
    
    String header = String("POST ") + path + " HTTP/1.1\r\n"
                    "Host: " + serverHost + "\r\n"
                    "Content-Type: application/json\r\n"
                    "Content-Length: " + jsonBody.length() + "\r\n"
                    "Connection: close\r\n\r\n";
    
    client.print(header);
    client.print(jsonBody);
    
    String response;
    unsigned long timeout = millis();
    while (client.connected() || client.available()) {
        if (client.available()) {
            response += (char)client.read();
            timeout = millis();
        }
        if (millis() - timeout > 5000) break;
        delay(1);
    }
    
    client.stop();
    
    // Check for 200 OK
    bool success = response.indexOf("200") > 0;
    if (logger) {
        if (success) {
            logger->info("POST successful");
        } else {
            logger->error("POST failed: " + response.substring(0, 100));
        }
    }
    
    return success;
}

bool BootstrapManager::fetchServerCredentials(const char* bootstrapPath) {
    if (logger) logger->info("Fetching server credentials (TOFU)...");
    
    String body = httpGet(bootstrapPath);
    if (body.length() == 0) {
        if (logger) logger->error("Bootstrap: empty response");
        return false;
    }
    
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, body);
    if (error) {
        if (logger) logger->error("Bootstrap: JSON parse failed");
        return false;
    }
    
    String certChain = doc["cert_chain_pem"].as<String>();
    String signPubKey = doc["server_pub_sign_key_pem"].as<String>();
    uint32_t srvTime = doc["srv_ts"].as<uint32_t>();
    
    if (certChain.length() == 0 || signPubKey.length() == 0) {
        if (logger) logger->error("Bootstrap: missing credentials");
        return false;
    }
    
    if (storage) {
        storage->setServerCredentials(certChain, signPubKey);
    }
    
    if (logger) {
        logger->info("Server credentials stored");
        logger->info("Server time: " + String(srvTime));
    }
    
    return true;
}

bool BootstrapManager::announcePublicKey(const char* announcePath, const String& pubKeyPem) {
    if (logger) logger->info("Announcing public key to server...");
    
    DynamicJsonDocument doc(2048);
    doc["pubkey_pem"] = pubKeyPem;
    
    String jsonBody;
    serializeJson(doc, jsonBody);
    
    return httpPost(announcePath, jsonBody);
}
