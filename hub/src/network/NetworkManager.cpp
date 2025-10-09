#include "NetworkManager.h"

// Static flag for connection status
static bool ethConnected = false;

NetworkManager::NetworkManager() {
    isConnected = false;
    logger = nullptr;
    lastCheckTime = 0;
}

void NetworkManager::setLogger(Logger* loggerInstance) {
    logger = loggerInstance;
}

void NetworkManager::onEthEvent(WiFiEvent_t event) {
    switch (event) {
        case ARDUINO_EVENT_ETH_START:
            Serial.println("[ETH] Ethernet Started");
            ETH.setHostname(HOSTNAME);
            break;
        case ARDUINO_EVENT_ETH_CONNECTED:
            Serial.println("[ETH] Ethernet Connected");
            break;
        case ARDUINO_EVENT_ETH_GOT_IP:
            Serial.print("[ETH] Ethernet Got IP: ");
            Serial.println(ETH.localIP());
            Serial.print("[ETH] MAC: ");
            Serial.println(ETH.macAddress());
            Serial.print("[ETH] Speed: ");
            Serial.print(ETH.linkSpeed());
            Serial.println("Mbps");
            ethConnected = true;
            break;
        case ARDUINO_EVENT_ETH_DISCONNECTED:
            Serial.println("[ETH] Ethernet Disconnected");
            ethConnected = false;
            break;
        case ARDUINO_EVENT_ETH_STOP:
            Serial.println("[ETH] Ethernet Stopped");
            ethConnected = false;
            break;
        default:
            break;
    }
}

void NetworkManager::setupStaticIP() {
    IPAddress local_ip, gateway, subnet, dns1, dns2;
    
    local_ip.fromString(STATIC_IP);
    gateway.fromString(GATEWAY);
    subnet.fromString(SUBNET);
    dns1.fromString(DNS_PRIMARY);
    dns2.fromString(DNS_SECONDARY);
    
    if (!ETH.config(local_ip, gateway, subnet, dns1, dns2)) {
        Serial.println("[ETH] Static IP configuration failed");
    }
}

bool NetworkManager::begin() {
    WiFi.onEvent(onEthEvent);
    
    // Initialize Ethernet with WT32-ETH01 specific pins
    bool success = ETH.begin(
        ETH_PHY_ADDR,
        ETH_PHY_POWER,
        ETH_PHY_MDC,
        ETH_PHY_MDIO,
        ETH_PHY_TYPE,
        ETH_CLK_MODE
    );
    
    if (!success) {
        if (logger) logger->error("ETH.begin() failed");
        return false;
    }
    
    // Configure static IP if not using DHCP
    if (!DHCP_ENABLED) {
        setupStaticIP();
    }
    
    // Wait for connection (timeout after 10 seconds)
    int timeout = 0;
    while (!ethConnected && timeout < 100) {
        delay(100);
        timeout++;
    }
    
    isConnected = ethConnected;
    return isConnected;
}

void NetworkManager::loop() {
    // Periodic connection check
    unsigned long currentTime = millis();
    if (currentTime - lastCheckTime >= NETWORK_CHECK_INTERVAL) {
        lastCheckTime = currentTime;
        isConnected = ethConnected;
        
        if (!isConnected && logger) {
            logger->warning("Ethernet connection lost");
        }
    }
}

bool NetworkManager::isEthernetConnected() {
    return ethConnected;
}

String NetworkManager::getIPAddress() {
    if (ethConnected) {
        return ETH.localIP().toString();
    }
    return "0.0.0.0";
}

String NetworkManager::getMACAddress() {
    return ETH.macAddress();
}
