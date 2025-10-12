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
    bool fetchServerCredentials(const char* bootstrapPath);
    String httpGet(const char* path);
};

#endif // BOOTSTRAP_MANAGER_H
