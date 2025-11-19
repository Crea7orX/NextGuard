#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <Arduino.h>
#include <ETH.h>
#include <WiFi.h>
#include <config/Config.h>
#include <logger/Logger.h>

enum NetworkMode {
    NETWORK_NONE,
    NETWORK_ETHERNET,
    NETWORK_WIFI
};

class NetworkManager {
private:
    bool isConnected;
    Logger* logger;
    unsigned long lastCheckTime;
    NetworkMode currentMode;
    bool wifiInitialized;
    
    static void onEthEvent(WiFiEvent_t event);
    static void onWiFiEvent(WiFiEvent_t event);
    void setupStaticIP();
    void startWiFi();
    void stopWiFi();
    void checkAndSwitchNetwork();

public:
    NetworkManager();
    
    bool begin();
    void loop();
    bool isEthernetConnected();
    bool isWiFiConnected();
    bool hasConnection();
    NetworkMode getMode();
    String getIPAddress();
    String getMACAddress();
    void setLogger(Logger* loggerInstance);
};

#endif // NETWORK_MANAGER_H
