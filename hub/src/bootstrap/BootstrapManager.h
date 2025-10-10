#ifndef BOOTSTRAP_MANAGER_H
#define BOOTSTRAP_MANAGER_H

#include <Arduino.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <logger/Logger.h>
#include <storage/StorageManager.h>

class BootstrapManager {
private:
    Logger* logger;
    StorageManager* storage;
    String serverHost;
    uint16_t serverPort;

public:
    BootstrapManager();
    
    void begin(Logger* loggerInstance, StorageManager* storageInstance, 
               const char* host, uint16_t port);
    
    // TOFU Bootstrap: Fetch server certificate and signing public key
    bool fetchServerCredentials(const char* bootstrapPath);
    
    // Announce device public key to server
    bool announcePublicKey(const char* announcePath, const String& pubKeyPem);
    
    // HTTP GET with TLS (insecure for initial TOFU)
    String httpGet(const char* path);
    
    // HTTP POST with TLS (insecure for initial TOFU)
    bool httpPost(const char* path, const String& jsonBody);
};

#endif // BOOTSTRAP_MANAGER_H
