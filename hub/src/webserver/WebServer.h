#ifndef WEB_SERVER_H
#define WEB_SERVER_H

#include <Arduino.h>
#include <WebServer.h>
#include <config/Config.h>
#include <logger/Logger.h>
#include <network/NetworkManager.h>

class WebServerManager {
private:
    WebServer* server;
    Logger* logger;
    NetworkManager* networkManager;
    bool isRunning;
    
    // Route handlers
    void handleRoot();
    void handleStatus();
    void handleNotFound();
    
    // Helper methods
    String getStatusJSON();
    String getHTMLHeader();
    String getHTMLFooter();

public:
    WebServerManager();
    ~WebServerManager();
    
    void begin(Logger* loggerInstance, NetworkManager* netManager, uint16_t port = 80);
    void loop();
    void stop();
    bool isActive();
};

#endif // WEB_SERVER_H
