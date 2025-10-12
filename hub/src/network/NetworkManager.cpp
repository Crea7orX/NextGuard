#include "NetworkManager.h"

// Static flags for connection status
static bool ethConnected = false;
static bool wifiConnected = false;

NetworkManager::NetworkManager() {
    isConnected = false;
    logger = nullptr;
    lastCheckTime = 0;
    currentMode = NETWORK_NONE;
    wifiInitialized = false;
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

void NetworkManager::onWiFiEvent(WiFiEvent_t event) {
    switch (event) {
        case ARDUINO_EVENT_WIFI_STA_START:
            Serial.println("[WiFi] Station Started");
            break;
        case ARDUINO_EVENT_WIFI_STA_CONNECTED:
            Serial.println("[WiFi] Connected to AP");
            break;
        case ARDUINO_EVENT_WIFI_STA_GOT_IP:
            Serial.print("[WiFi] Got IP: ");
            Serial.println(WiFi.localIP());
            wifiConnected = true;
            break;
        case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
            Serial.println("[WiFi] Disconnected from AP");
            wifiConnected = false;
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

void NetworkManager::startWiFi() {
    if (wifiInitialized) return;
    
    if (logger) logger->info("Starting WiFi fallback...");
    
    WiFi.onEvent(onWiFiEvent);
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    wifiInitialized = true;
    
    // Wait for connection with timeout
    int attempts = 0;
    while (!wifiConnected && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (wifiConnected) {
        currentMode = NETWORK_WIFI;
        isConnected = true;
        if (logger) {
            logger->info("\nWiFi connected!");
            logger->info("IP Address: " + WiFi.localIP().toString());
        }
    } else {
        if (logger) logger->error("\nWiFi connection failed!");
        // If WiFi failed, clean up
        WiFi.disconnect(true);
        WiFi.mode(WIFI_OFF);
        wifiInitialized = false;
    }
}

void NetworkManager::stopWiFi() {
    if (!wifiInitialized) return;
    
    if (logger) logger->info("Stopping WiFi to save power...");
    
    // Remove event handler first
    WiFi.removeEvent(onWiFiEvent);
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    delay(100); // Give time for WiFi to fully power down
    
    wifiInitialized = false;
    wifiConnected = false;
}

void NetworkManager::checkAndSwitchNetwork() {
    // Priority: Ethernet > WiFi
    if (ethConnected && currentMode != NETWORK_ETHERNET) {
        // Ethernet is available, switch to it
        if (logger) logger->info("Ethernet available, switching from WiFi");
        
        // Stop WiFi if it's running (save power)
        if (currentMode == NETWORK_WIFI) {
            stopWiFi();
        }
        
        currentMode = NETWORK_ETHERNET;
        isConnected = true;
        
        if (logger) {
            logger->info("Now using Ethernet");
            logger->info("IP Address: " + ETH.localIP().toString());
        }
    } else if (!ethConnected && currentMode == NETWORK_ETHERNET) {
        // Ethernet lost, fallback to WiFi
        if (logger) logger->warning("Ethernet connection lost, switching to WiFi");
        
        currentMode = NETWORK_NONE;
        isConnected = false;
        startWiFi();
    } else if (!ethConnected && !wifiConnected && currentMode == NETWORK_WIFI) {
        // WiFi connection lost while in WiFi mode
        if (logger) logger->warning("WiFi connection lost, attempting to reconnect...");
        currentMode = NETWORK_NONE;
        isConnected = false;
        
        // Try to reconnect WiFi
        stopWiFi();
        delay(1000);
        startWiFi();
    } else if (!ethConnected && !wifiConnected && currentMode != NETWORK_NONE) {
        // Lost all connections
        if (logger) logger->error("All network connections lost");
        currentMode = NETWORK_NONE;
        isConnected = false;
    }
}

bool NetworkManager::begin() {
    // Ensure WiFi is completely off initially (we prioritize Ethernet)
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    delay(100); // Give time for WiFi to fully power down
    
    // Register Ethernet event handler
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
        // Try WiFi immediately if Ethernet init fails
        delay(500); // Wait before starting WiFi to avoid power spike
        startWiFi();
        return isConnected;
    }
    
    // Configure static IP if not using DHCP
    if (!DHCP_ENABLED) {
        setupStaticIP();
    }
    
    // Wait for Ethernet connection (timeout after 10 seconds)
    int timeout = 0;
    while (!ethConnected && timeout < 100) {
        delay(100);
        timeout++;
    }
    
    if (ethConnected) {
        currentMode = NETWORK_ETHERNET;
        isConnected = true;
        if (logger) logger->info("Using Ethernet (WiFi disabled to save power)");
    } else {
        // Ethernet didn't connect, fallback to WiFi
        if (logger) logger->warning("Ethernet timeout, trying WiFi");
        delay(500); // Wait before starting WiFi to avoid power spike
        startWiFi();
    }
    
    return isConnected;
}

void NetworkManager::loop() {
    // Periodic connection check and network switching
    unsigned long currentTime = millis();
    if (currentTime - lastCheckTime >= NETWORK_CHECK_INTERVAL) {
        lastCheckTime = currentTime;
        
        // Check and switch networks if needed
        checkAndSwitchNetwork();
    }
}

bool NetworkManager::isEthernetConnected() {
    return ethConnected;
}

bool NetworkManager::isWiFiConnected() {
    return wifiConnected;
}

bool NetworkManager::hasConnection() {
    return isConnected && (ethConnected || wifiConnected);
}

NetworkMode NetworkManager::getMode() {
    return currentMode;
}

String NetworkManager::getIPAddress() {
    if (currentMode == NETWORK_ETHERNET && ethConnected) {
        return ETH.localIP().toString();
    } else if (currentMode == NETWORK_WIFI && wifiConnected) {
        return WiFi.localIP().toString();
    }
    return "0.0.0.0";
}

String NetworkManager::getMACAddress() {
    if (currentMode == NETWORK_ETHERNET) {
        return ETH.macAddress();
    } else if (currentMode == NETWORK_WIFI) {
        return WiFi.macAddress();
    }
    return "00:00:00:00:00:00";
}
