#ifndef PROTOCOL_UTILS_H
#define PROTOCOL_UTILS_H

#include <Arduino.h>

// LoRa Protocol Message Types
#define MSG_ADOPT_REQ 0x01      // Adoption request from node
#define MSG_ADOPT_RSP 0x02      // Adoption response from hub
#define MSG_DATA 0x10           // Encrypted data from node
#define MSG_COMMAND 0x20        // Encrypted command from hub
#define MSG_DISCOVERY 0x03      // Discovery packet from non-adopted nodes
#define MSG_DISCOVERY_ACK 0x04  // Acknowledgement of discovery packet
#define MSG_CHALLENGE 0x05      // Challenge for counter sync (bidirectional)
#define MSG_CHALLENGE_RSP 0x06  // Challenge response (bidirectional)

// Configuration Constants
#define MAX_NODES 10
#define MAX_DISCOVERED_NODES 10
#define ADOPTION_TIMEOUT 30000
#define LORA_FREQUENCY 868E6
#define PACKET_QUEUE_SIZE 5

// Packet size constants
#define MAX_PACKET_SIZE 255
#define UUID_SIZE 16
#define SESSION_KEY_SIZE 16
#define NONCE_SIZE 8
#define HMAC_SIZE 32
#define AES_BLOCK_SIZE 16
#define COUNTER_SIZE 4

// Node Information Structure
struct NodeInfo {
    uint8_t nodeId[UUID_SIZE];      // 128-bit UUID
    uint8_t sessionKey[SESSION_KEY_SIZE];
    bool active;
    unsigned long lastSeen;
    uint32_t txCounter;             // Counter for commands sent to node (hub->node)
    uint32_t rxCounter;             // Expected counter for data from node (node->hub)
    uint32_t lastRxCounter;         // Last received counter (for duplicate detection)
};

// Discovered Node Information (not yet adopted)
struct DiscoveredNode {
    uint8_t nodeId[UUID_SIZE];      // 128-bit UUID
    unsigned long lastSeen;
    int rssi;
    float snr;
};

// Packet Queue Buffer
struct PacketBuffer {
    uint8_t data[MAX_PACKET_SIZE];
    int length;
    bool ready;
};

class ProtocolUtils {
public:
    // Packet size calculations
    static size_t getAdoptionRequestSize() { return 1 + UUID_SIZE + 40; }  // type + UUID + pubkey
    static size_t getAdoptionResponseSize() { return 1 + UUID_SIZE + 1 + 40; }  // type + UUID + status + pubkey
    static size_t getChallengePacketSize() { return 1 + UUID_SIZE + COUNTER_SIZE * 2 + NONCE_SIZE + HMAC_SIZE; }
    static size_t getChallengeResponseSize() { return 1 + UUID_SIZE + COUNTER_SIZE * 2 + NONCE_SIZE + HMAC_SIZE; }
    
    // Minimum sizes for validation
    static size_t getMinDataPacketSize() { return 1 + UUID_SIZE + 4 + NONCE_SIZE + 1 + AES_BLOCK_SIZE + HMAC_SIZE; }
    static size_t getMinDiscoverySize() { return 1 + UUID_SIZE; }
    
    // UUID formatting helpers
    static void printUUID(const uint8_t* uuid);
};

#endif // PROTOCOL_UTILS_H
