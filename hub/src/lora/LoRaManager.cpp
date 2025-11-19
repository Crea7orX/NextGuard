#include "LoRaManager.h"
#include <websocket/WebSocketManager.h>

LoRaManager::LoRaManager() : adoptionStartTime(0), hasPendingNode(false) {
    logger = nullptr;
    nodeManager = nullptr;
    wsManager = nullptr;
    memset(hubPrivKey, 0, sizeof(hubPrivKey));
    memset(hubPubKey, 0, sizeof(hubPubKey));
    memset(pendingAdoptionNodeId, 0, sizeof(pendingAdoptionNodeId));
}

void LoRaManager::begin(Logger* loggerInstance, NodeManager* nodeManagerInstance, WebSocketManager* wsManagerInstance, long frequency) {
    logger = loggerInstance;
    nodeManager = nodeManagerInstance;
    wsManager = wsManagerInstance;

    // Initialize packet queue
    RadioManager::initPacketQueue(PACKET_QUEUE_SIZE);
    
    // Initialize LoRa radio
    if (!RadioManager::begin(frequency)) {
        return;
    }
    
    // Generate hub's ECDH key pair
    logger->info("Generating hub LoRa key pair...");
    if (!SecurityUtils::generateKeyPair(hubPrivKey, hubPubKey)) {
        logger->error("Key generation failed!");
        return;
    }
    
    // Start receiving
    RadioManager::startReceive();
}

void LoRaManager::process() {
    // Check for adoption timeout
    if (hasPendingNode && (millis() - adoptionStartTime > ADOPTION_TIMEOUT)) {
        disableAdoptionMode();
    }
    
    // Process received packets
    if (RadioManager::hasPacket()) {
        PacketBuffer* packet = RadioManager::getNextPacket();
        if (packet == nullptr) return;
        
        int rssi = RadioManager::getLastRSSI();
        float snr = RadioManager::getLastSNR();
        
        logger->info("Received packet, RSSI: " + String(rssi) + " dBm, SNR: " + String(snr) + " dB, Length: " + String(packet->length));
        
        uint8_t msgType = packet->data[0];
        
        switch (msgType) {
            case MSG_DISCOVERY:
                handleDiscovery(packet->data, packet->length, rssi, snr);
                break;
            case MSG_ADOPT_REQ:
                handleAdoptionRequest(packet->data, packet->length);
                break;
            case MSG_CHALLENGE:
                handleChallenge(packet->data, packet->length);
                break;
            case MSG_DATA:
                handleEncryptedData(packet->data, packet->length);
                break;
            default:
                logger->warning("Unknown message type: 0x" + String(msgType, HEX));
        }
        
        RadioManager::markPacketProcessed();
    }
}

void LoRaManager::handleDiscovery(const uint8_t* payload, size_t len, int rssi, float snr) {
    if (len < ProtocolUtils::getMinDiscoverySize()) {
        logger->warning("Invalid discovery packet size");
        return;
    }
    
    const uint8_t* nodeId = payload + 1;
    
    // Check if already adopted
    if (nodeManager->findNode(nodeId) != -1) {
        return; // Already adopted, ignore
    }
    
    // Add to discovered nodes
    nodeManager->addDiscoveredNode(nodeId, rssi, snr);
    
    // Send info to server
    DynamicJsonDocument discoveryDoc(2048);

    discoveryDoc["serialId"] = Utils::uuidToString(nodeId);
    discoveryDoc["rssi"] = rssi;
    discoveryDoc["snr"] = snr;

    wsManager->sendMessage("discovery", discoveryDoc);
}

void LoRaManager::handleAdoptionRequest(const uint8_t* payload, size_t len) {
    if (len < ProtocolUtils::getAdoptionRequestSize()) {
        logger->warning("Invalid adoption request size");
        return;
    }
    
    const uint8_t* nodeId = payload + 1;
    const uint8_t* nodePubKey = payload + 17;
    
    logger->info("Adoption request from node UUID: " + Utils::uuidToString(nodeId));
    
    if (!hasPendingNode) {
        logger->warning("Not in adoption mode - ignoring");
        return;
    }
    
    // Check if this node is the one we're expecting to adopt
    if (memcmp(nodeId, pendingAdoptionNodeId, UUID_SIZE) != 0) {
        logger->warning("Adoption request from unexpected node - ignoring. Expected: " + Utils::uuidToString(pendingAdoptionNodeId));
        return;
    }
    
    // Compute shared secret using ECDH
    uint8_t sharedSecret[SHARED_SECRET_SIZE];
    if (!SecurityUtils::computeSharedSecret(nodePubKey, hubPrivKey, sharedSecret)) {
        logger->error("ECDH failed!");
        return;
    }
    
    // Derive session key
    uint8_t sessionKey[SESSION_KEY_SIZE];
    SecurityUtils::deriveSessionKey(sharedSecret, sessionKey);
    
    // Add node
    if (!nodeManager->addNode(nodeId, sessionKey)) {
        logger->error("Failed to add node");
        return;
    }
    
    // Send adoption response
    uint8_t response[ProtocolUtils::getAdoptionResponseSize()];
    response[0] = MSG_ADOPT_RSP;
    memcpy(response + 1, nodeId, UUID_SIZE);
    response[17] = 0x01; // Success
    memcpy(response + 18, hubPubKey, ECC_PUBLIC_KEY_SIZE);
    
    if (RadioManager::sendPacket(response, sizeof(response))) {
        logger->info("Adoption response sent");

        // Clear pending adoption
        hasPendingNode = false;
        memset(pendingAdoptionNodeId, 0, sizeof(pendingAdoptionNodeId));

        // Disable adoption mode after successful adoption
        disableAdoptionMode();
        
        // Send info to server
        DynamicJsonDocument discoveryDoc(1024);

        discoveryDoc["serialId"] = Utils::uuidToString(nodeId);
        discoveryDoc["sharedSecret"] = Utils::toHexString(sharedSecret, SHARED_SECRET_SIZE);

        wsManager->sendMessage("hub_node_adoption", discoveryDoc);
    } else {
        logger->error("Failed to send adoption response");
    }
}

void LoRaManager::handleChallenge(const uint8_t* payload, size_t len) {
    if (len < ProtocolUtils::getChallengePacketSize()) {
        logger->warning("Invalid challenge packet size");
        return;
    }
    
    const uint8_t* nodeId = payload + 1;
    
    int idx = nodeManager->findNode(nodeId);
    if (idx == -1) {
        logger->warning("Challenge from unknown node UUID: " + Utils::uuidToString(nodeId));
        return;
    }
    
    NodeInfo* node = nodeManager->getNode(idx);
    
    // Verify HMAC
    size_t hmacDataLen = len - HMAC_SIZE;
    const uint8_t* receivedHmac = payload + hmacDataLen;
    
    if (!SecurityUtils::verifyHMAC(node->sessionKey, SESSION_KEY_SIZE, payload, hmacDataLen, receivedHmac)) {
        logger->error("Challenge HMAC verification FAILED!");
        return;
    }
    
    // Extract counters and nonce
    uint32_t nodeTxCounter, nodeRxCounter;
    memcpy(&nodeTxCounter, payload + 17, COUNTER_SIZE);
    memcpy(&nodeRxCounter, payload + 21, COUNTER_SIZE);
    
    const uint8_t* nonce = payload + 25;
    
    logger->info("Challenge from node - Node TX: " + String(nodeTxCounter) + ", Node RX: " + String(nodeRxCounter) + ", Nonce: " + Utils::toHexString(nonce, 4) + "...");
    
    // Sync counters
    nodeManager->syncCounters(idx, nodeTxCounter, nodeRxCounter);
    
    // Send challenge response
    uint8_t response[ProtocolUtils::getChallengeResponseSize()];
    response[0] = MSG_CHALLENGE_RSP;
    memcpy(response + 1, nodeId, UUID_SIZE);
    memcpy(response + 17, &node->txCounter, COUNTER_SIZE);
    memcpy(response + 21, &node->rxCounter, COUNTER_SIZE);
    memcpy(response + 25, nonce, NONCE_SIZE); // Echo nonce
    
    // Compute HMAC
    uint8_t hmac[HMAC_SIZE];
    SecurityUtils::computeHMAC(node->sessionKey, SESSION_KEY_SIZE, response, 33, hmac);
    memcpy(response + 33, hmac, HMAC_SIZE);
    
    if (RadioManager::sendPacket(response, sizeof(response))) {
        logger->info("Challenge response sent - Counter sync complete");
    } else {
        logger->error("Failed to send challenge response");
    }
}

void LoRaManager::handleEncryptedData(const uint8_t* payload, size_t len) {
    if (len < ProtocolUtils::getMinDataPacketSize()) {
        logger->warning("Invalid data packet size");
        return;
    }
    
    const uint8_t* nodeId = payload + 1;
    
    int idx = nodeManager->findNode(nodeId);
    if (idx == -1) {
        logger->warning("Unknown node UUID: " + Utils::uuidToString(nodeId));
        return;
    }
    
    NodeInfo* node = nodeManager->getNode(idx);
    
    // Decrypt packet
    uint8_t plaintext[128];
    size_t plaintextLen;
    
    if (!EncryptionUtils::decryptPacket(aes, payload, len, node->sessionKey,
                                       node->rxCounter, plaintext, &plaintextLen)) {
        logger->error("Decryption failed");
        return;
    }
    
    // Extract counter from packet for validation
    uint32_t counter;
    memcpy(&counter, payload + 17, COUNTER_SIZE);
    
    // Validate counter
    if (!nodeManager->validateCounter(idx, counter)) {
        return; // Already logged by NodeManager
    }
    
    // Update node state
    nodeManager->updateRxCounter(idx, counter);
    nodeManager->updateNodeLastSeen(idx);
    
    logger->info("Decrypted message from node UUID: " + Utils::uuidToString(nodeId) + ", counter: " + String(counter));
    
    // logger->info("Data: " + Utils::toHexString(plaintext, plaintextLen));
    Serial.print("[LORA_MGR] Data: ");
    for (size_t i = 0; i < plaintextLen; i++) {
        Serial.write(plaintext[i]);
    }
    Serial.println();
    
    // Send message to server via WebSocket
    DynamicJsonDocument msgDoc(512);
    msgDoc["serialId"] = Utils::uuidToString(nodeId);
    
    // Convert plaintext to string
    String message = "";
    for (size_t i = 0; i < plaintextLen; i++) {
        message += (char)plaintext[i];
    }
    msgDoc["message"] = message;
    
    wsManager->sendMessage("hub_message_from_node", msgDoc);
}

// TODO: Implement down functions

void LoRaManager::enableAdoptionMode(const uint8_t* nodeId, unsigned long duration) {
    adoptionStartTime = millis();
    hasPendingNode = true;
    memcpy(pendingAdoptionNodeId, nodeId, UUID_SIZE);
    
    Serial.print("[LORA_MGR] *** ADOPTION MODE ACTIVE FOR ");
    Serial.print(duration / 1000);
    Serial.print(" SECONDS FOR NODE: ");
    ProtocolUtils::printUUID(nodeId);
    Serial.println(" ***");
}

void LoRaManager::disableAdoptionMode() {
    hasPendingNode = false;
    memset(pendingAdoptionNodeId, 0, sizeof(pendingAdoptionNodeId));
    Serial.println("[LORA_MGR] Adoption mode ended");
}

bool LoRaManager::sendCommandOld(int nodeIndex, const char* command) {
    NodeInfo* node = nodeManager->getNode(nodeIndex);
    if (node == nullptr || !node->active) {
        Serial.println("[LORA_MGR] Invalid node index");
        return false;
    }
    
    return sendCommandByUUID(node->nodeId, command);
}

bool LoRaManager::sendCommand(const uint8_t* nodeId, const char* command, uint8_t msgType) {
    // Build unencrypted command packet
    // Format: [MSG_TYPE(1)] [NODE_ID(16)] [COMMAND(variable)]
    size_t commandLen = strlen(command);
    size_t packetLen = 1 + UUID_SIZE + commandLen;
    
    if (packetLen > 255) {
        Serial.println("[LORA_MGR] Command too long");
        return false;
    }
    
    uint8_t packet[255];
    packet[0] = msgType;
    memcpy(packet + 1, nodeId, UUID_SIZE);
    memcpy(packet + 1 + UUID_SIZE, command, commandLen);
    
    Serial.print("[LORA_MGR] Sending unencrypted command to node UUID: ");
    ProtocolUtils::printUUID(nodeId);
    Serial.print(": ");
    Serial.println(command);
    
    if (RadioManager::sendPacket(packet, packetLen)) {
        Serial.println("[LORA_MGR] Unencrypted command sent");
        return true;
    } else {
        Serial.println("[LORA_MGR] Failed to send unencrypted command");
        return false;
    }
}

bool LoRaManager::sendCommandByUUID(const uint8_t* nodeId, const char* command) {
    int idx = nodeManager->findNode(nodeId);
    if (idx == -1) {
        Serial.print("[LORA_MGR] Cannot send command - unknown node UUID: ");
        ProtocolUtils::printUUID(nodeId);
        Serial.println();
        return false;
    }
    
    NodeInfo* node = nodeManager->getNode(idx);
    
    Serial.print("[LORA_MGR] Sending command to node UUID: ");
    ProtocolUtils::printUUID(nodeId);
    Serial.print(": ");
    Serial.println(command);
    
    // Encrypt and build packet
    uint8_t packet[136];
    size_t packetLen = EncryptionUtils::encryptPacket(aes, nodeId, node->sessionKey,
                                                      node->txCounter, MSG_COMMAND,
                                                      command, packet);
    
    if (packetLen == 0) {
        Serial.println("[LORA_MGR] Failed to encrypt command");
        return false;
    }
    
    uint32_t currentCounter = node->txCounter;
    nodeManager->incrementTxCounter(idx);
    
    if (RadioManager::sendPacket(packet, packetLen)) {
        Serial.print("[LORA_MGR] Command sent, counter: ");
        Serial.println(currentCounter);
        return true;
    } else {
        Serial.println("[LORA_MGR] Failed to send command");
        return false;
    }
}

void LoRaManager::listActiveNodes() {
    nodeManager->printActiveNodes();
}

void LoRaManager::listDiscoveredNodes() {
    nodeManager->printDiscoveredNodes();
}

void LoRaManager::printStatus() {
    Serial.println("[LORA_MGR] === Hub Status ===");
    Serial.print("Active nodes: ");
    Serial.println(nodeManager->getActiveNodeCount());
    
    int dropped = RadioManager::getDroppedPacketCount();
    if (dropped > 0) {
        Serial.print("Dropped packets: ");
        Serial.println(dropped);
    }
    
    Serial.print("Adoption mode: ");
    Serial.println(hasPendingNode ? "ENABLED" : "disabled");
    
    if (hasPendingNode) {
        Serial.print("Pending node: ");
        ProtocolUtils::printUUID(pendingAdoptionNodeId);
        Serial.println();
    }
}
