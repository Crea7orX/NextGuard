#ifndef NODE_MANAGER_H
#define NODE_MANAGER_H

#include <Arduino.h>
#include <utils/ProtocolUtils.h>
#include <logger/Logger.h>
#include <utils/Utils.h>

class NodeManager {
private:
    Logger* logger;
    NodeInfo* nodes;
    DiscoveredNode* discoveredNodes;
    int maxNodes;
    int maxDiscoveredNodes;
    
public:
    NodeManager(int maxNodes = MAX_NODES, int maxDiscovered = MAX_DISCOVERED_NODES);
    ~NodeManager();
    
    // Initialize the node arrays
    void begin(Logger* loggerInstance);
    
    // Node management
    int findNode(const uint8_t* nodeId);
    int findFreeSlot();
    bool addNode(const uint8_t* nodeId, const uint8_t* sessionKey);
    void removeNode(int index);
    void updateNodeLastSeen(int index);
    
    // Node state access
    NodeInfo* getNode(int index);
    bool isNodeActive(int index);
    int getActiveNodeCount();
    
    // Counter management
    void incrementTxCounter(int index);
    void incrementRxCounter(int index);
    void updateRxCounter(int index, uint32_t newCounter);
    bool validateCounter(int index, uint32_t receivedCounter);
    void syncCounters(int index, uint32_t nodeTxCounter, uint32_t nodeRxCounter);
    
    // Discovery management
    void addDiscoveredNode(const uint8_t* nodeId, int rssi, float snr);
    bool isNodeDiscovered(const uint8_t* nodeId);
    void clearOldDiscoveredNodes(unsigned long maxAge = 60000);
    
    // Node list operations
    void printActiveNodes();
    void printDiscoveredNodes();
};

#endif // NODE_MANAGER_H
