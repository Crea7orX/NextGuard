#ifndef TELEMETRY_H
#define TELEMETRY_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <esp_system.h>
#include <esp_chip_info.h>
#include <esp_task_wdt.h>
#include <network/NetworkManager.h>
#include <websocket/WebSocketManager.h>
#include <logger/Logger.h>
#include <config/Config.h>

class Telemetry {
private:
    Logger* logger;
    NetworkManager* networkManager;
    WebSocketManager* wsManager;
    unsigned long bootTime;
    unsigned long lastResetReason;
    unsigned long lastTelemetrySent;

public:
    Telemetry();
    
    void begin(Logger* loggerInstance, NetworkManager* netManager, WebSocketManager* wsManagerInstance);
    void loop();
    void getSystemInfo(JsonObject& obj);
    void getCPUInfo(JsonObject& obj);
    void getMemoryInfo(JsonObject& obj);
    void getNetworkInfo(JsonObject& obj);
    void createTelemetry(JsonDocument& doc);
    void sendTelemetry();
    String getResetReasonString();
    float getCPUTemperature();
    uint32_t getUptime();
};

#endif // TELEMETRY_H
