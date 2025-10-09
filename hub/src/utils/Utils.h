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
};

#endif // UTILS_H
