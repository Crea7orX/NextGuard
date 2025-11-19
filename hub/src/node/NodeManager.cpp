#include "NodeManager.h"

NodeManager::NodeManager(int maxNodes, int maxDiscovered) {
    logger = nullptr;

    this->maxNodes = maxNodes;
    this->maxDiscoveredNodes = maxDiscovered;
    
    nodes = new NodeInfo[maxNodes];
    discoveredNodes = new DiscoveredNode[maxDiscovered];
}

NodeManager::~NodeManager() {
    delete[] nodes;
    delete[] discoveredNodes;
}

void NodeManager::begin(Logger* loggerInstance) {
    logger = loggerInstance;

    // Initialize nodes array
    for (int i = 0; i < maxNodes; i++) {
        nodes[i].active = false;
        memset(nodes[i].nodeId, 0, UUID_SIZE);
        memset(nodes[i].sessionKey, 0, SESSION_KEY_SIZE);
        nodes[i].lastSeen = 0;
        nodes[i].txCounter = 0;
        nodes[i].rxCounter = 0;
        nodes[i].lastRxCounter = 0xFFFFFFFF;
    }
    
    // Initialize discovered nodes array
    for (int i = 0; i < maxDiscoveredNodes; i++) {
        memset(discoveredNodes[i].nodeId, 0, UUID_SIZE);
        discoveredNodes[i].lastSeen = 0;
        discoveredNodes[i].rssi = 0;
        discoveredNodes[i].snr = 0.0;
    }
}

int NodeManager::findNode(const uint8_t* nodeId) {
    for (int i = 0; i < maxNodes; i++) {
        if (nodes[i].active && memcmp(nodes[i].nodeId, nodeId, UUID_SIZE) == 0) {
            return i;
        }
    }
    return -1;
}

int NodeManager::findFreeSlot() {
    for (int i = 0; i < maxNodes; i++) {
        if (!nodes[i].active) {
            return i;
        }
    }
    return -1;
}

bool NodeManager::addNode(const uint8_t* nodeId, const uint8_t* sessionKey) {
    int idx = findNode(nodeId);
    
    if (idx == -1) {
        idx = findFreeSlot();
        if (idx == -1) {
            logger->warning("No free slots available");
            return false;
        }
    }
    
    memcpy(nodes[idx].nodeId, nodeId, UUID_SIZE);
    memcpy(nodes[idx].sessionKey, sessionKey, SESSION_KEY_SIZE);
    nodes[idx].active = true;
    nodes[idx].lastSeen = millis();
    nodes[idx].txCounter = 0;
    nodes[idx].rxCounter = 0;
    nodes[idx].lastRxCounter = 0xFFFFFFFF;
    
    logger->info("Node added at index " + String(idx) + ": " + Utils::uuidToString(nodeId));
    
    return true;
}

void NodeManager::removeNode(int index) {
    if (index >= 0 && index < maxNodes) {
        nodes[index].active = false;
        memset(nodes[index].nodeId, 0, UUID_SIZE);
        memset(nodes[index].sessionKey, 0, SESSION_KEY_SIZE);
        logger->info("Node removed at index " + String(index));
    }
}

void NodeManager::updateNodeLastSeen(int index) {
    if (index >= 0 && index < maxNodes && nodes[index].active) {
        nodes[index].lastSeen = millis();
    }
}

NodeInfo* NodeManager::getNode(int index) {
    if (index >= 0 && index < maxNodes) {
        return &nodes[index];
    }
    return nullptr;
}

bool NodeManager::isNodeActive(int index) {
    if (index >= 0 && index < maxNodes) {
        return nodes[index].active;
    }
    return false;
}

int NodeManager::getActiveNodeCount() {
    int count = 0;
    for (int i = 0; i < maxNodes; i++) {
        if (nodes[i].active) count++;
    }
    return count;
}

void NodeManager::incrementTxCounter(int index) {
    if (index >= 0 && index < maxNodes && nodes[index].active) {
        nodes[index].txCounter++;
    }
}

void NodeManager::incrementRxCounter(int index) {
    if (index >= 0 && index < maxNodes && nodes[index].active) {
        nodes[index].rxCounter++;
    }
}

void NodeManager::updateRxCounter(int index, uint32_t newCounter) {
    if (index >= 0 && index < maxNodes && nodes[index].active) {
        nodes[index].lastRxCounter = newCounter;
        nodes[index].rxCounter = newCounter + 1;
    }
}

bool NodeManager::validateCounter(int index, uint32_t receivedCounter) {
    if (index < 0 || index >= maxNodes || !nodes[index].active) {
        return false;
    }
    
    // Check for replay attack
    if (receivedCounter < nodes[index].rxCounter) {
        logger->warning("Replay attack detected! Counter " + String(receivedCounter) + " < expected " + String(nodes[index].rxCounter));
        return false;
    }
    
    // Check for duplicate
    if (receivedCounter == nodes[index].lastRxCounter) {
        logger->warning("Duplicate message detected!");
        return false;
    }
    
    return true;
}

void NodeManager::syncCounters(int index, uint32_t nodeTxCounter, uint32_t nodeRxCounter) {
    if (index >= 0 && index < maxNodes && nodes[index].active) {
        nodes[index].rxCounter = nodeTxCounter;
        nodes[index].lastRxCounter = 0xFFFFFFFF;
        
        logger->info("Counter sync - Hub RX: " + String(nodes[index].rxCounter) + ", Hub TX: " + String(nodes[index].txCounter));
    }
}

void NodeManager::addDiscoveredNode(const uint8_t* nodeId, int rssi, float snr) {
    // Check if already adopted
    if (findNode(nodeId) != -1) {
        return; // Already adopted, don't add to discovered list
    }
    
    // Find existing entry or empty slot
    int idx = -1;
    for (int i = 0; i < maxDiscoveredNodes; i++) {
        if (memcmp(discoveredNodes[i].nodeId, nodeId, UUID_SIZE) == 0) {
            idx = i;
            break;
        }
    }
    
    if (idx == -1) {
        // Find empty slot
        for (int i = 0; i < maxDiscoveredNodes; i++) {
            if (Utils::isUUIDEmpty(discoveredNodes[i].nodeId)) {
                idx = i;
                break;
            }
        }
    }
    
    if (idx != -1) {
        memcpy(discoveredNodes[idx].nodeId, nodeId, UUID_SIZE);
        discoveredNodes[idx].lastSeen = millis();
        discoveredNodes[idx].rssi = rssi;
        discoveredNodes[idx].snr = snr;
    }
}

bool NodeManager::isNodeDiscovered(const uint8_t* nodeId) {
    for (int i = 0; i < maxDiscoveredNodes; i++) {
        if (memcmp(discoveredNodes[i].nodeId, nodeId, UUID_SIZE) == 0) {
            return true;
        }
    }
    return false;
}

void NodeManager::clearOldDiscoveredNodes(unsigned long maxAge) {
    unsigned long now = millis();
    for (int i = 0; i < maxDiscoveredNodes; i++) {
        if (!Utils::isUUIDEmpty(discoveredNodes[i].nodeId)) {
            if (now - discoveredNodes[i].lastSeen > maxAge) {
                memset(discoveredNodes[i].nodeId, 0, UUID_SIZE);
                discoveredNodes[i].lastSeen = 0;
            }
        }
    }
}

void NodeManager::printActiveNodes() {
    logger->info("Active nodes:");
    bool foundAny = false;
    
    for (int i = 0; i < maxNodes; i++) {
        if (nodes[i].active) {
            logger->info("  [" + String(i) + "] UUID: " + Utils::uuidToString(nodes[i].nodeId) + " - last seen " + String((millis() - nodes[i].lastSeen) / 1000) + "s ago");
            foundAny = true;
        }
    }
    
    if (!foundAny) {
        logger->info("  (none)");
    }
}

void NodeManager::printDiscoveredNodes() {
    logger->info("Discovered nodes (not adopted):");
    bool foundAny = false;
    
    for (int i = 0; i < maxDiscoveredNodes; i++) {
        if (!Utils::isUUIDEmpty(discoveredNodes[i].nodeId)) {
            unsigned long age = millis() - discoveredNodes[i].lastSeen;
            if (age < 60000) { // Show nodes seen in last 60s
                logger->info("  UUID: " + Utils::uuidToString(discoveredNodes[i].nodeId) + " - RSSI: " + String(discoveredNodes[i].rssi) + " dBm, SNR: " + String(discoveredNodes[i].snr) + " dB, last seen " + String(age / 1000) + "s ago");
                foundAny = true;
            }
        }
    }
    
    if (!foundAny) {
        logger->info("  (none)");
    }
}

void NodeManager::clearNodes() {
    // Clear all active nodes
    for (int i = 0; i < maxNodes; i++) {
        nodes[i].active = false;
        memset(nodes[i].nodeId, 0, UUID_SIZE);
        memset(nodes[i].sessionKey, 0, SESSION_KEY_SIZE);
        nodes[i].lastSeen = 0;
        nodes[i].txCounter = 0;
        nodes[i].rxCounter = 0;
        nodes[i].lastRxCounter = 0xFFFFFFFF;
    }
    
    logger->info("All nodes cleared, ready for restoration");
}
