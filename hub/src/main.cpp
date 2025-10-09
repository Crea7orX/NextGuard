#include <Arduino.h>
#include <config/Config.h>
#include <network/NetworkManager.h>
#include <logger/Logger.h>
#include <websocket/WebSocketManager.h>
#include <webserver/WebServer.h>

// Global instances
NetworkManager networkManager;
Logger logger;
WebSocketManager wsManager;
WebServerManager webServer;

void setup() {
    // Initialize Serial
    Serial.begin(115200);
    delay(1000);
    
    logger.info("Starting WT32-ETH01 Device...");
    logger.info("Device ID: " + String(DEVICE_ID));
    
    // Initialize Network (Ethernet)
    logger.info("Initializing Ethernet...");
    if (networkManager.begin()) {
        logger.info("Ethernet initialized successfully");
        logger.info("IP Address: " + networkManager.getIPAddress());
    } else {
        logger.error("Ethernet initialization failed!");
    }
    
    // Initialize WebSocket
    logger.info("Initializing WebSocket...");
    wsManager.begin(&logger);
    wsManager.connect();
    
    // Initialize Web Server
    logger.info("Initializing Web Server...");
    webServer.begin(&logger, &networkManager);
    
    logger.info("Setup completed");
}

void loop() {
    // Keep network alive
    networkManager.loop();
    
    // Handle WebSocket communication
    wsManager.loop();
    
    // Handle Web Server requests
    webServer.loop();
    
    // Your main code here
    
    delay(10);
}
