#ifndef LORA_MANAGER_H
#define LORA_MANAGER_H

#include <Arduino.h>
#include <AES.h>
#include <radio/RadioManager.h>
#include <utils/ProtocolUtils.h>
#include <node/NodeManager.h>
#include <utils/SecurityUtils.h>
#include <utils/EncryptionUtils.h>
#include <config/Config.h>
#include <utils/Utils.h>
#include <logger/Logger.h>

// Forward declarations to avoid circular dependency
class WebSocketManager;

class LoRaManager {
private:
    Logger* logger;
    NodeManager* nodeManager;
    WebSocketManager* wsManager;
    AES128 aes;
    
    // Hub's ECDH key pair
    uint8_t hubPrivKey[ECC_PRIVATE_KEY_SIZE];
    uint8_t hubPubKey[ECC_PUBLIC_KEY_SIZE];
    
    // Adoption state
    unsigned long adoptionStartTime;
    uint8_t pendingAdoptionNodeId[UUID_SIZE];
    bool hasPendingNode;
    
    // Message handlers
    void handleDiscovery(const uint8_t* payload, size_t len, int rssi, float snr);
    void handleAdoptionRequest(const uint8_t* payload, size_t len);
    void handleChallenge(const uint8_t* payload, size_t len);
    void handleEncryptedData(const uint8_t* payload, size_t len);
    
public:
    LoRaManager();
    
    // Initialize LoRa and generate keys
    void begin(Logger* loggerInstance, NodeManager* nodeManagerInstance, WebSocketManager* wsManagerInstance, long frequency = LORA_FREQUENCY);
    
    // Main processing loop
    void process();
    
    // Adoption management
    void enableAdoptionMode(const uint8_t* nodeId, unsigned long duration = ADOPTION_TIMEOUT);
    void disableAdoptionMode();
    bool isAdoptionMode() { return hasPendingNode; }
    
    // Send command to node
    bool sendCommand(const uint8_t* nodeId, const char* command, uint8_t msgType = MSG_COMMAND);
    bool sendCommandOld(int nodeIndex, const char* command);
    bool sendCommandByUUID(const uint8_t* nodeId, const char* command);
    
    // Node information
    void listActiveNodes();
    void listDiscoveredNodes();
    int getActiveNodeCount() { return nodeManager->getActiveNodeCount(); }
    NodeInfo* getNode(int index) { return nodeManager->getNode(index); }
    
    // Status reporting
    void printStatus();
};

#endif // LORA_MANAGER_H
