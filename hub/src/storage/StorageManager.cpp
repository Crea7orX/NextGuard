#include "StorageManager.h"

StorageManager::StorageManager() : initialized(false) {
}

bool StorageManager::begin(const char* namespace_name) {
    initialized = prefs.begin(namespace_name, false);
    return initialized;
}

String StorageManager::getString(const char* key, const String& defaultValue) {
    if (!initialized) return defaultValue;
    return prefs.getString(key, defaultValue);
}

bool StorageManager::putString(const char* key, const String& value) {
    if (!initialized) return false;
    return prefs.putString(key, value) > 0;
}

uint32_t StorageManager::getUInt32(const char* key, uint32_t defaultValue) {
    if (!initialized) return defaultValue;
    return prefs.getUInt(key, defaultValue);
}

bool StorageManager::putUInt32(const char* key, uint32_t value) {
    if (!initialized) return false;
    return prefs.putUInt(key, value) > 0;
}

bool StorageManager::remove(const char* key) {
    if (!initialized) return false;
    return prefs.remove(key);
}

bool StorageManager::clear() {
    if (!initialized) return false;
    return prefs.clear();
}

String StorageManager::getDevicePrivateKey() {
    return getString("dev_priv");
}

String StorageManager::getDevicePublicKey() {
    return getString("dev_pub");
}

bool StorageManager::setDeviceKeys(const String& privKey, const String& pubKey) {
    return putString("dev_priv", privKey) && putString("dev_pub", pubKey);
}

String StorageManager::getServerCertificate() {
    return getString("srv_cert");
}

String StorageManager::getServerSigningPublicKey() {
    return getString("srv_sign_pub");
}

bool StorageManager::setServerCredentials(const String& cert, const String& signPubKey) {
    return putString("srv_cert", cert) && putString("srv_sign_pub", signPubKey);
}

bool StorageManager::isAdopted() {
    return getUInt32("adopted", 0) == 1;
}

bool StorageManager::setAdopted(bool adopted) {
    return putUInt32("adopted", adopted ? 1 : 0);
}

bool StorageManager::hasDeviceKeys() {
    String priv = getDevicePrivateKey();
    String pub = getDevicePublicKey();
    return priv.length() > 0 && pub.length() > 0;
}

bool StorageManager::hasServerCredentials() {
    String cert = getServerCertificate();
    String sign = getServerSigningPublicKey();
    return cert.length() > 0 && sign.length() > 0;
}
