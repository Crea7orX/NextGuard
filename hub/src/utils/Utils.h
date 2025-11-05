#ifndef UTILS_H
#define UTILS_H

#include <Arduino.h>

class Utils {
public:
    // String utilities
    static String trimString(String str);
    static String toUpperCase(String str);
    static String toLowerCase(String str);
    
    // Time utilities
    static String formatUptime(unsigned long milliseconds);
    static unsigned long getUptime();
    
    // Memory utilities
    static uint32_t getFreeHeap();
    static uint32_t getHeapSize();
    static float getHeapUsagePercent();
    
    // Conversion utilities
    static String ipToString(IPAddress ip);
    static bool stringToIP(String str, IPAddress &ip);
    
    // Validation utilities
    static bool isValidIP(String ip);
    static bool isValidMAC(String mac);

    // UUID formatting utilities
    static String uuidToString(const uint8_t* uuid);
    static bool stringToUUID(String str, uint8_t* uuid);
    static bool isUUIDEmpty(const uint8_t* uuid);

    // Hex formatting utilities
    static String toHexString(const uint8_t* data, size_t len);
};

#endif // UTILS_H
