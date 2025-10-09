#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <Arduino.h>
#include <ETH.h>
#include <config/Config.h>
#include <logger/Logger.h>

class NetworkManager {
private:
    bool isConnected;
    Logger* logger;
    unsigned long lastCheckTime;
    
    static void onEthEvent(WiFiEvent_t event);
    void setupStaticIP();

public:
    NetworkManager();
    
    bool begin();
    void loop();
    bool isEthernetConnected();
    String getIPAddress();
    String getMACAddress();
    void setLogger(Logger* loggerInstance);
};

#endif // NETWORK_MANAGER_H
