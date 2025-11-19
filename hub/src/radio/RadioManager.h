#ifndef RADIO_UTILS_H
#define RADIO_UTILS_H

#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <utils/ProtocolUtils.h>

// LoRa pins for WT32-ETH01
#define RFM95_CS 2
#define RFM95_RST 15
#define RFM95_DIO0 35
#define SPI_MOSI_PIN 14
#define SPI_MISO_PIN 36
#define SPI_SCK_PIN 12

class RadioManager {
private:
    static PacketBuffer* packetQueue;
    static volatile int writeIndex;
    static int readIndex;
    static volatile int droppedPackets;
    static int queueSize;
    
    // ISR callback
    static void onReceiveISR(int packetSize);
    
public:
    // Initialize LoRa with custom pins and settings
    static bool begin(long frequency = LORA_FREQUENCY);
    
    // Packet queue management
    static void initPacketQueue(int size = PACKET_QUEUE_SIZE);
    static void cleanupPacketQueue();
    static bool hasPacket();
    static PacketBuffer* getNextPacket();
    static void markPacketProcessed();
    static int getDroppedPacketCount();
    static void resetDroppedPacketCount();
    
    // Send packets
    static bool sendPacket(const uint8_t* data, size_t length);
    
    // Get packet info
    static int getLastRSSI();
    static float getLastSNR();
    
    // LoRa configuration
    static void setSpreadingFactor(int sf);
    static void setBandwidth(long bw);
    static void setSyncWord(uint8_t sw);
    static void setTxPower(int power);
    
    // Start/stop receiving
    static void startReceive();
    static void stopReceive();
};

#endif // RADIO_UTILS_H
