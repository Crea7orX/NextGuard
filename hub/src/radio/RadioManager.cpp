#include "RadioManager.h"

// Static member initialization
PacketBuffer* RadioManager::packetQueue = nullptr;
volatile int RadioManager::writeIndex = 0;
int RadioManager::readIndex = 0;
volatile int RadioManager::droppedPackets = 0;
int RadioManager::queueSize = 0;

bool RadioManager::begin(long frequency) {
    Serial.println("[RADIO] Initializing LoRa...");
    
    // Initialize SPI with custom pins
    SPI.begin(SPI_SCK_PIN, SPI_MISO_PIN, SPI_MOSI_PIN, RFM95_CS);
    
    // Setup LoRa
    LoRa.setPins(RFM95_CS, RFM95_RST, RFM95_DIO0);
    
    if (!LoRa.begin(frequency)) {
        Serial.println("[RADIO] LoRa init FAILED!");
        return false;
    }
    
    // Default configuration
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setSyncWord(0x34);
    
    Serial.print("[RADIO] LoRa initialized at ");
    Serial.print(frequency / 1E6);
    Serial.println(" MHz");
    
    return true;
}

void RadioManager::initPacketQueue(int size) {
    queueSize = size;
    packetQueue = new PacketBuffer[size];
    
    for (int i = 0; i < size; i++) {
        packetQueue[i].ready = false;
        packetQueue[i].length = 0;
        memset(packetQueue[i].data, 0, MAX_PACKET_SIZE);
    }
    
    writeIndex = 0;
    readIndex = 0;
    droppedPackets = 0;
    
    Serial.print("[RADIO] Packet queue initialized (size: ");
    Serial.print(size);
    Serial.println(")");
}

void RadioManager::cleanupPacketQueue() {
    if (packetQueue != nullptr) {
        delete[] packetQueue;
        packetQueue = nullptr;
    }
}

void RadioManager::onReceiveISR(int packetSize) {
    if (packetSize == 0 || packetQueue == nullptr) return;
    
    // Check if current write buffer is available
    if (packetQueue[writeIndex].ready) {
        // Buffer full, drop packet
        droppedPackets++;
        while (LoRa.available()) {
            LoRa.read(); // Discard data
        }
        return;
    }
    
    // Read packet into current write buffer
    int len = 0;
    while (LoRa.available() && len < MAX_PACKET_SIZE) {
        packetQueue[writeIndex].data[len++] = LoRa.read();
    }
    
    if (len > 0) {
        packetQueue[writeIndex].length = len;
        packetQueue[writeIndex].ready = true;
        // Move to next buffer for next packet
        writeIndex = (writeIndex + 1) % queueSize;
    }
}

bool RadioManager::hasPacket() {
    if (packetQueue == nullptr) return false;
    return packetQueue[readIndex].ready;
}

PacketBuffer* RadioManager::getNextPacket() {
    if (!hasPacket()) return nullptr;
    return &packetQueue[readIndex];
}

void RadioManager::markPacketProcessed() {
    if (packetQueue == nullptr) return;
    
    packetQueue[readIndex].ready = false;
    readIndex = (readIndex + 1) % queueSize;
}

int RadioManager::getDroppedPacketCount() {
    return droppedPackets;
}

void RadioManager::resetDroppedPacketCount() {
    droppedPackets = 0;
}

bool RadioManager::sendPacket(const uint8_t* data, size_t length) {
    if (length == 0 || length > MAX_PACKET_SIZE) {
        Serial.println("[RADIO] Invalid packet size");
        return false;
    }
    
    LoRa.beginPacket();
    LoRa.write(data, length);
    bool success = LoRa.endPacket();
    
    // Go back to receive mode
    LoRa.receive();
    
    return success;
}

int RadioManager::getLastRSSI() {
    return LoRa.packetRssi();
}

float RadioManager::getLastSNR() {
    return LoRa.packetSnr();
}

void RadioManager::setSpreadingFactor(int sf) {
    LoRa.setSpreadingFactor(sf);
    Serial.print("[RADIO] Spreading factor set to ");
    Serial.println(sf);
}

void RadioManager::setBandwidth(long bw) {
    LoRa.setSignalBandwidth(bw);
    Serial.print("[RADIO] Bandwidth set to ");
    Serial.print(bw / 1000);
    Serial.println(" kHz");
}

void RadioManager::setSyncWord(uint8_t sw) {
    LoRa.setSyncWord(sw);
    Serial.print("[RADIO] Sync word set to 0x");
    Serial.println(sw, HEX);
}

void RadioManager::setTxPower(int power) {
    LoRa.setTxPower(power);
    Serial.print("[RADIO] TX power set to ");
    Serial.print(power);
    Serial.println(" dBm");
}

void RadioManager::startReceive() {
    LoRa.onReceive(onReceiveISR);
    LoRa.receive();
    Serial.println("[RADIO] Receiving enabled");
}

void RadioManager::stopReceive() {
    LoRa.onReceive(nullptr);
    Serial.println("[RADIO] Receiving disabled");
}
