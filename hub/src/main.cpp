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
#include <telemetry/Telemetry.h>
#include <lora/LoRaManager.h>

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
Telemetry telemetry;
NodeManager nodeManager;
LoRaManager loraManager;

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
    
    // Initialize Ethernet (with automatic WiFi fallback)
    logger.info("Initializing network...");
    networkManager.setLogger(&logger);
    if (networkManager.begin()) {
        if (networkManager.isEthernetConnected()) {
            logger.info("Ethernet connected!");
            logger.info("IP Address: " + networkManager.getIPAddress());
            logger.info("MAC Address: " + networkManager.getMACAddress());
        } else if (networkManager.isWiFiConnected()) {
            logger.info("WiFi connected!");
            logger.info("IP Address: " + networkManager.getIPAddress());
            logger.info("MAC Address: " + networkManager.getMACAddress());
        }
    } else {
        logger.error("Network initialization failed!");
        logger.error("No network connection available!");
        while (true) delay(1000);
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
    secureMsg.begin(&logger, &storage);
    
    // Initialize Node Manager
    logger.info("Initializing Node Manager...");
    nodeManager.begin(&logger);

    // Initialize LoRa Manager
    logger.info("Initializing LoRa Manager...");
    loraManager.begin(&logger, &nodeManager, &wsManager);
    
    // Initialize WebSocket
    logger.info("Initializing WebSocket...");
    wsManager.begin(&logger, &storage, &secureMsg, &loraManager);
    wsManager.setServer(SERVER_HOST, SERVER_PORT, WEBSOCKET_PATH, SERVER_USE_TLS);
    wsManager.connect();
    
    // Initialize telemetry (after WebSocket)
    logger.info("Initializing Telemetry...");
    telemetry.begin(&logger, &networkManager, &wsManager);
    
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
    
    // Handle automatic telemetry sending
    telemetry.loop();
    
    // Handle LoRa communication
    loraManager.process();
    
    // Handle serial commands for LoRa
    if (Serial.available()) {
        char cmd = Serial.read();
        if (cmd == 'a' || cmd == 'A') {
            loraManager.enableAdoptionMode();
        } else if (cmd == 's' || cmd == 'S') {
            // Send command to node
            Serial.println("[HUB] Enter command (format: nodeIndex,command):");
            Serial.println("[HUB] Example: 0,BLINK (use 'l' to list nodes)");
            
            String input = "";
            unsigned long startTime = millis();
            while (millis() - startTime < 10000) {  // 10 second timeout
                if (Serial.available()) {
                    char c = Serial.read();
                    if (c == '\n' || c == '\r') {
                        if (input.length() > 0) break;
                    } else {
                        input += c;
                    }
                }
                yield();
            }
            
            if (input.length() > 0) {
                int commaPos = input.indexOf(',');
                if (commaPos > 0) {
                    String indexStr = input.substring(0, commaPos);
                    String command = input.substring(commaPos + 1);
                    
                    int nodeIndex = indexStr.toInt();
                    loraManager.sendCommandOld(nodeIndex, command.c_str());
                } else {
                    Serial.println("[HUB] Invalid format");
                }
            }
        } else if (cmd == 'l' || cmd == 'L') {
            loraManager.listActiveNodes();
        } else if (cmd == 'd' || cmd == 'D') {
            loraManager.listDiscoveredNodes();
        } else if (cmd == 'h' || cmd == 'H' || cmd == '?') {
            Serial.println("[HUB] LoRa Commands:");
            Serial.println("  a - Enter adoption mode");
            Serial.println("  s - Send command to node");
            Serial.println("  l - List active nodes");
            Serial.println("  d - List discovered nodes");
            Serial.println("  h - Show this help");
        }
    }
    
    delay(LOOP_DELAY_MS);
}
