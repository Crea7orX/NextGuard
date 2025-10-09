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
