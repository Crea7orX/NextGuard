#include "Telemetry.h"

Telemetry::Telemetry() {
    logger = nullptr;
    networkManager = nullptr;
    wsManager = nullptr;
    bootTime = millis();
    lastResetReason = esp_reset_reason();
    lastTelemetrySent = 0;
}

void Telemetry::begin(Logger* loggerInstance, NetworkManager* netManager, WebSocketManager* wsManagerInstance) {
    logger = loggerInstance;
    networkManager = netManager;
    wsManager = wsManagerInstance;
}

String Telemetry::getResetReasonString() {
    switch (lastResetReason) {
        case ESP_RST_UNKNOWN:    return "Unknown";
        case ESP_RST_POWERON:    return "Power-on";
        case ESP_RST_EXT:        return "External pin";
        case ESP_RST_SW:         return "Software reset";
        case ESP_RST_PANIC:      return "Exception/panic";
        case ESP_RST_INT_WDT:    return "Interrupt watchdog";
        case ESP_RST_TASK_WDT:   return "Task watchdog";
        case ESP_RST_WDT:        return "Other watchdog";
        case ESP_RST_DEEPSLEEP:  return "Deep sleep";
        case ESP_RST_BROWNOUT:   return "Brownout";
        case ESP_RST_SDIO:       return "SDIO";
        default:                 return "Unknown";
    }
}

float Telemetry::getCPUTemperature() {
    return temperatureRead();
}

uint32_t Telemetry::getUptime() {
    return (millis() - bootTime) / 1000;
}

void Telemetry::getSystemInfo(JsonObject& obj) {
    obj["firmware"] = FIRMWARE_VERSION;
    obj["uptime"] = getUptime();
    obj["reset_reason"] = getResetReasonString();
    
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);
    
    obj["chip_model"] = "ESP32";
    obj["chip_cores"] = chip_info.cores;
    obj["chip_revision"] = chip_info.revision;
    obj["chip_features"] = 0;
    
    if (chip_info.features & CHIP_FEATURE_WIFI_BGN) {
        obj["chip_features"] = obj["chip_features"].as<int>() | 0x01;
    }
    if (chip_info.features & CHIP_FEATURE_BT) {
        obj["chip_features"] = obj["chip_features"].as<int>() | 0x02;
    }
    if (chip_info.features & CHIP_FEATURE_BLE) {
        obj["chip_features"] = obj["chip_features"].as<int>() | 0x04;
    }
}

void Telemetry::getCPUInfo(JsonObject& obj) {
    obj["freq_mhz"] = getCpuFrequencyMhz();
    obj["temp_c"] = getCPUTemperature();
    
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);
    obj["cores"] = chip_info.cores;
}

void Telemetry::getMemoryInfo(JsonObject& obj) {
    obj["heap_total"] = ESP.getHeapSize();
    obj["heap_free"] = ESP.getFreeHeap();
    obj["heap_used"] = ESP.getHeapSize() - ESP.getFreeHeap();
    obj["heap_used_pct"] = (float)(ESP.getHeapSize() - ESP.getFreeHeap()) / ESP.getHeapSize() * 100.0;
    obj["heap_min_free"] = ESP.getMinFreeHeap();
    obj["heap_max_alloc"] = ESP.getMaxAllocHeap();
}

void Telemetry::getNetworkInfo(JsonObject& obj) {
    obj["ip_address"] = networkManager->getIPAddress();
    obj["mac_address"] = networkManager->getMACAddress();
    obj["network_mode"] = networkManager->isWiFiConnected() ? "wifi" : 
                            (networkManager->isEthernetConnected() ? "ethernet" : "none");
    
    if (networkManager->isWiFiConnected()) {
        obj["wifi_rssi"] = WiFi.RSSI();
        obj["wifi_ssid"] = WiFi.SSID();
        obj["wifi_channel"] = WiFi.channel();
    }
    
    if (networkManager->isEthernetConnected()) {
        obj["eth_speed_mbps"] = ETH.linkSpeed();
        obj["eth_full_duplex"] = ETH.fullDuplex();
    }
}

void Telemetry::createTelemetry(JsonDocument& doc) {
    JsonObject system = doc.createNestedObject("system");
    getSystemInfo(system);
    
    JsonObject cpu = doc.createNestedObject("cpu");
    getCPUInfo(cpu);
    
    JsonObject memory = doc.createNestedObject("memory");
    getMemoryInfo(memory);
    
    JsonObject network = doc.createNestedObject("network");
    getNetworkInfo(network);
}

void Telemetry::loop() {
    if (wsManager->isAuth() && millis() - lastTelemetrySent >= TELEMETRY_INTERVAL) {
        sendTelemetry();
    }
}

void Telemetry::sendTelemetry() {
    if (!wsManager->isAuth()) {
        return;
    }
    
    DynamicJsonDocument telemetryDoc(2048);
    createTelemetry(telemetryDoc);
    
    if (wsManager->sendTelemetry(telemetryDoc)) {
        lastTelemetrySent = millis();
    }
}
