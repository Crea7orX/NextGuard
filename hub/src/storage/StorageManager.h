#ifndef STORAGE_MANAGER_H
#define STORAGE_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>

class StorageManager {
private:
    Preferences prefs;
    bool initialized;

public:
    StorageManager();
    
    // Initialize storage
    bool begin(const char* namespace_name = "hub");
    
    // String operations
    String getString(const char* key, const String& defaultValue = "");
    bool putString(const char* key, const String& value);
    
    // Integer operations
    uint32_t getUInt32(const char* key, uint32_t defaultValue = 0);
    bool putUInt32(const char* key, uint32_t value);
    
    // Remove operations
    bool remove(const char* key);
    bool clear();
    
    // Device keys
    String getDevicePrivateKey();
    String getDevicePublicKey();
    bool setDeviceKeys(const String& privKey, const String& pubKey);
    
    // Server credentials
    String getServerCertificate();
    String getServerSigningPublicKey();
    bool setServerCredentials(const String& cert, const String& signPubKey);
    
    // Adoption status
    bool isAdopted();
    bool setAdopted(bool adopted);
    
    // Check if keys exist
    bool hasDeviceKeys();
    bool hasServerCredentials();
};

#endif // STORAGE_MANAGER_H
