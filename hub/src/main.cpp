#include <Arduino.h>
#include <ETH.h>
#include <WiFi.h>
#include <config/Config.h>
#include <logger/Logger.h>
#include <storage/StorageManager.h>
#include <crypto/CryptoManager.h>
#include <bootstrap/BootstrapManager.h>
#include <secure/SecureMessage.h>
#include <websocket/WebSocketManager.h>
#include <factory/FactoryReset.h>
#include <webserver/WebServer.h>
#include <network/NetworkManager.h>

// Global instances
Logger logger;
StorageManager storage;
CryptoManager crypto;
BootstrapManager bootstrap;
SecureMessage secureMsg;
WebSocketManager wsManager;
FactoryReset factoryReset;
WebServerManager webServer;
NetworkManager networkManager;

// Timing
unsigned long lastTelemetry = 0;

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);
    delay(500);
    
    logger.info("=================================");
    logger.info("WT32-ETH01 Secure Hub Starting...");
    logger.info("Device ID: " + String(DEVICE_ID));
    logger.info("Firmware: " + String(FIRMWARE_VERSION));
    logger.info("=================================");
    
    // Initialize storage
    if (!storage.begin("hub")) {
        logger.error("Failed to initialize storage!");
        while (true) delay(1000);
    }
    logger.info("Storage initialized");
    
    // Check for factory reset
    factoryReset.begin(&logger, &storage, BOOT_BUTTON_PIN, BUTTON_HOLD_TIME);
    if (factoryReset.checkButtonHeld()) {
        factoryReset.performReset();
        // Device will restart, execution won't continue
    }
    
    // Initialize Ethernet
    logger.info("Initializing Ethernet...");
    networkManager.setLogger(&logger);
    if (networkManager.begin()) {
        logger.info("Ethernet connected!");
        logger.info("IP Address: " + networkManager.getIPAddress());
        logger.info("MAC Address: " + networkManager.getMACAddress());
    } else {
        logger.error("Ethernet initialization failed!");
        logger.info("Falling back to WiFi...");
        
        // Try WiFi as backup
        WiFi.mode(WIFI_STA);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        logger.info("Connecting to WiFi...");
        
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(500);
            Serial.print(".");
            attempts++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            logger.info("\nWiFi connected!");
            logger.info("IP Address: " + WiFi.localIP().toString());
        } else {
            logger.error("\nWiFi connection failed!");
            logger.error("No network connection available!");
            while (true) delay(1000);
        }
    }
    
    // Ensure device keys exist
    if (!storage.hasDeviceKeys()) {
        logger.info("Generating ECDSA key pair...");
        String devPriv, devPub;
        if (!CryptoManager::generateECDSAKeyPair(devPriv, devPub)) {
            logger.error("Key generation failed!");
            while (true) delay(1000);
        }
        
        storage.setDeviceKeys(devPriv, devPub);
        logger.info("Device keys generated and stored");
        
        // Announce public key to server
        bootstrap.begin(&logger, &storage, SERVER_HOST, SERVER_PORT);
        if (bootstrap.announcePublicKey(ANNOUNCE_PATH, devPub)) {
            logger.info("Public key announced to server");
        } else {
            logger.warning("Failed to announce public key");
        }
    }
    
    // Bootstrap server credentials (TOFU)
    if (!storage.hasServerCredentials()) {
        logger.info("Bootstrapping server credentials (TOFU)...");
        bootstrap.begin(&logger, &storage, SERVER_HOST, SERVER_PORT);
        
        if (!bootstrap.fetchServerCredentials(BOOTSTRAP_PATH)) {
            logger.error("Bootstrap failed!");
            while (true) delay(1000);
        }
        
        logger.info("Server credentials stored");
    }
    
    // Initialize secure messaging
    secureMsg.begin(&logger);
    
    // Initialize WebSocket
    logger.info("Initializing WebSocket...");
    wsManager.begin(&logger, &storage, &secureMsg);
    wsManager.setServer(SERVER_HOST, SERVER_PORT, WEBSOCKET_PATH, SERVER_USE_TLS);
    wsManager.connect();
    
    // Initialize Web Server
    logger.info("Initializing Web Server...");
    webServer.begin(&logger, &networkManager);
    
    logger.info("=================================");
    logger.info("Setup completed successfully!");
    logger.info("=================================");
}

void loop() {
    // Keep network alive
    networkManager.loop();
    
    // Handle WebSocket communication
    wsManager.loop();
    
    // Handle Web Server requests
    webServer.loop();
    
    // Send telemetry periodically
    if (wsManager.isAuth() && millis() - lastTelemetry >= TELEMETRY_INTERVAL) {
        lastTelemetry = millis();
        
        StaticJsonDocument<256> telemetry;
        telemetry["uptime"] = millis() / 1000;
        telemetry["free_heap"] = ESP.getFreeHeap();
        telemetry["ip"] = networkManager.isEthernetConnected() ? 
                         networkManager.getIPAddress() : WiFi.localIP().toString();
        telemetry["rssi"] = WiFi.RSSI();
        
        wsManager.sendTelemetry(telemetry);
        logger.debug("Telemetry sent");
    }
    
    delay(LOOP_DELAY_MS);
}
