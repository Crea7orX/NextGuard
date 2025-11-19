#include "Utils.h"

// String utilities
String Utils::trimString(String str) {
    str.trim();
    return str;
}

String Utils::toUpperCase(String str) {
    str.toUpperCase();
    return str;
}

String Utils::toLowerCase(String str) {
    str.toLowerCase();
    return str;
}

// Time utilities
String Utils::formatUptime(unsigned long milliseconds) {
    unsigned long seconds = milliseconds / 1000;
    unsigned long minutes = seconds / 60;
    unsigned long hours = minutes / 60;
    unsigned long days = hours / 24;
    
    String uptime = "";
    if (days > 0) uptime += String(days) + "d ";
    if (hours > 0) uptime += String(hours % 24) + "h ";
    if (minutes > 0) uptime += String(minutes % 60) + "m ";
    uptime += String(seconds % 60) + "s";
    
    return uptime;
}

unsigned long Utils::getUptime() {
    return millis();
}

// Memory utilities
uint32_t Utils::getFreeHeap() {
    return ESP.getFreeHeap();
}

uint32_t Utils::getHeapSize() {
    return ESP.getHeapSize();
}

float Utils::getHeapUsagePercent() {
    uint32_t total = getHeapSize();
    uint32_t free = getFreeHeap();
    return ((float)(total - free) / total) * 100.0;
}

// Conversion utilities
String Utils::ipToString(IPAddress ip) {
    return ip.toString();
}

bool Utils::stringToIP(String str, IPAddress &ip) {
    return ip.fromString(str);
}

// Validation utilities
bool Utils::isValidIP(String ip) {
    IPAddress testIP;
    return testIP.fromString(ip);
}

bool Utils::isValidMAC(String mac) {
    // Basic MAC address validation (XX:XX:XX:XX:XX:XX)
    if (mac.length() != 17) return false;
    
    for (int i = 0; i < 17; i++) {
        if (i % 3 == 2) {
            if (mac.charAt(i) != ':') return false;
        } else {
            char c = mac.charAt(i);
            if (!isHexadecimalDigit(c)) return false;
        }
    }
    return true;
}

// UUID formatting utilities
String Utils::uuidToString(const uint8_t* uuid) {
    String result = "";
    for (int i = 0; i < 16; i++) {
        if (uuid[i] < 0x10) result += "0";
        result += String(uuid[i], HEX);
        if (i == 3 || i == 5 || i == 7 || i == 9) result += "-";
    }
    return result;
}

bool Utils::stringToUUID(String uuidStr, uint8_t* uuid) {
    // Remove dashes and validate length
    uuidStr.replace("-", "");
    if (uuidStr.length() != 32) return false;
    
    // Convert hex string to bytes
    for (int i = 0; i < 16; i++) {
        String byteStr = uuidStr.substring(i * 2, i * 2 + 2);
        char* endPtr;
        long value = strtol(byteStr.c_str(), &endPtr, 16);
        
        // Check if conversion was successful
        if (*endPtr != '\0' || value < 0 || value > 255) {
            return false;
        }
        
        uuid[i] = (uint8_t)value;
    }
    
    return true;
}

bool Utils::isUUIDEmpty(const uint8_t* uuid) {
    for (int i = 0; i < 16; i++) {
        if (uuid[i] != 0) return false;
    }
    return true;
}

// Hex formatting utilities
String Utils::toHexString(const uint8_t* data, size_t len) {
    String result = "";
    for (size_t i = 0; i < len; i++) {
        if (data[i] < 0x10) result += "0";
        result += String(data[i], HEX);
    }
    return result;
}
