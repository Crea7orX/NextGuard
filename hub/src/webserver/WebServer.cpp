#include "WebServer.h"
#include <utils/Utils.h>

WebServerManager::WebServerManager() {
    server = nullptr;
    logger = nullptr;
    networkManager = nullptr;
    isRunning = false;
}

WebServerManager::~WebServerManager() {
    if (server) {
        delete server;
    }
}

void WebServerManager::begin(Logger* loggerInstance, NetworkManager* netManager, uint16_t port) {
    logger = loggerInstance;
    networkManager = netManager;
    
    server = new WebServer(port);
    
    // Define routes
    server->on("/", [this]() { this->handleRoot(); });
    server->on("/status", [this]() { this->handleStatus(); });
    server->onNotFound([this]() { this->handleNotFound(); });
    
    server->begin();
    isRunning = true;
    
    if (logger) logger->info("Web server started on port " + String(port));
}

void WebServerManager::loop() {
    if (server && isRunning) {
        server->handleClient();
    }
}

void WebServerManager::stop() {
    if (server) {
        server->stop();
        isRunning = false;
        if (logger) logger->info("Web server stopped");
    }
}

bool WebServerManager::isActive() {
    return isRunning;
}

String WebServerManager::getHTMLHeader() {
    String html = "<!DOCTYPE html><html><head>";
    html += "<title>" + String(DEVICE_ID) + "</title>";
    html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
    html += "<style>";
    html += "body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }";
    html += ".container { background: white; padding: 20px; border-radius: 8px; max-width: 800px; margin: 0 auto; }";
    html += "h1 { color: #333; }";
    html += ".info { margin: 10px 0; padding: 10px; background: #e8f4f8; border-radius: 4px; }";
    html += ".button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px; }";
    html += ".button:hover { background: #0056b3; }";
    html += "</style></head><body><div class='container'>";
    return html;
}

String WebServerManager::getHTMLFooter() {
    return "</div></body></html>";
}

void WebServerManager::handleRoot() {
    String html = getHTMLHeader();
    html += "<h1>WT32-ETH01 Device</h1>";
    html += "<div class='info'><strong>Device ID:</strong> " + String(DEVICE_ID) + "</div>";
    html += "<div class='info'><strong>Firmware:</strong> " + String(FIRMWARE_VERSION) + "</div>";
    
    if (networkManager) {
        html += "<div class='info'><strong>IP Address:</strong> " + networkManager->getIPAddress() + "</div>";
        html += "<div class='info'><strong>MAC Address:</strong> " + networkManager->getMACAddress() + "</div>";
    }
    
    html += "<div class='info'><strong>Uptime:</strong> " + Utils::formatUptime(millis()) + "</div>";
    html += "<div class='info'><strong>Free Heap:</strong> " + String(Utils::getFreeHeap()) + " bytes</div>";
    
    html += "<br><a href='/status' class='button'>Status JSON</a>";
    html += getHTMLFooter();
    
    server->send(200, "text/html", html);
}

String WebServerManager::getStatusJSON() {
    String json = "{";
    json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    json += "\"firmware\":\"" + String(FIRMWARE_VERSION) + "\",";
    json += "\"uptime\":" + String(millis()) + ",";
    json += "\"free_heap\":" + String(Utils::getFreeHeap()) + ",";
    json += "\"heap_size\":" + String(Utils::getHeapSize()) + ",";
    
    if (networkManager) {
        json += "\"ip\":\"" + networkManager->getIPAddress() + "\",";
        json += "\"mac\":\"" + networkManager->getMACAddress() + "\",";
        json += "\"connected\":" + String(networkManager->isEthernetConnected() ? "true" : "false");
    }
    
    json += "}";
    return json;
}

void WebServerManager::handleStatus() {
    server->send(200, "application/json", getStatusJSON());
}

void WebServerManager::handleNotFound() {
    String message = "404 - Not Found\n\n";
    message += "URI: " + server->uri() + "\n";
    message += "Method: " + String((server->method() == HTTP_GET) ? "GET" : "POST") + "\n";
    server->send(404, "text/plain", message);
}
