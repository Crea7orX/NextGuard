#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// Device Configuration
#define DEVICE_ID "99e54666-82e4-4254-9afb-0e96a575fe71"
#define FIRMWARE_VERSION "1.0.0"

// WiFi Configuration (for WT32-ETH01, WiFi is backup option)
#define WIFI_SSID "WIFI_SSID"
#define WIFI_PASSWORD "WIFI_PASSWOD"

// Network Configuration
#define HOSTNAME "wt32-eth01"
#define DHCP_ENABLED true

// Static IP Configuration (used if DHCP_ENABLED is false)
#define STATIC_IP "192.168.1.100"
#define GATEWAY "192.168.1.1"
#define SUBNET "255.255.255.0"
#define DNS_PRIMARY "8.8.8.8"
#define DNS_SECONDARY "8.8.4.4"

// Server Configuration
#define SERVER_HOST "192.168.1.1"
#define SERVER_PORT 443
#define SERVER_USE_TLS true

// Server Endpoints
#define BOOTSTRAP_PATH "/api/bootstrap"
#define ANNOUNCE_PATH "/api/adopt/announce"
#define WEBSOCKET_PATH "/ws"

// WebSocket Configuration
#define WEBSOCKET_ENABLED true
#define WEBSOCKET_RECONNECT_INTERVAL 2000  // 2 seconds
#define WEBSOCKET_HEARTBEAT_INTERVAL 25000  // 25 seconds
#define WEBSOCKET_HEARTBEAT_TIMEOUT 5000    // 5 seconds
#define WEBSOCKET_HEARTBEAT_RETRIES 2

// Secure Protocol Configuration
#define MAX_TIME_DRIFT 120  // seconds
#define TELEMETRY_INTERVAL 10000  // 10 seconds

// Factory Reset Configuration
#define BOOT_BUTTON_PIN 0
#define BUTTON_HOLD_TIME 3000  // 3 seconds

// Ethernet PHY Configuration for WT32-ETH01
#define ETH_PHY_TYPE ETH_PHY_LAN8720
#define ETH_PHY_ADDR 1
#define ETH_PHY_MDC 23
#define ETH_PHY_MDIO 18
#define ETH_PHY_POWER 16
#define ETH_CLK_MODE ETH_CLOCK_GPIO0_IN

// Timing Configuration
#define LOOP_DELAY_MS 10
#define NETWORK_CHECK_INTERVAL 30000  // 30 seconds

// SPI Configuration
#define SPI_MOSI_PIN 14
#define SPI_MISO_PIN 36
#define SPI_SCK_PIN 12

// RF95 LoRa Configuration
#define RF95_ENABLED true
#define RF95_CS_PIN 2
#define RF95_INT_PIN 35
#define RF95_RST_PIN 15
#define RF95_FREQ 868.1    // 868.1 MHz (EU)
#define RF95_TX_POWER 20   // 20 dBm (max for RFM95)
#define RF95_SPREADING_FACTOR 7  // SF7 = faster, less range; SF12 = slower, more range
#define RF95_BANDWIDTH 125000    // 125 kHz
#define RF95_CODING_RATE 5       // 4/5 coding rate

// ECC Configuration
#define ECC_PRIVATE_KEY_SIZE 21   // secp160r1 private key (20 bytes + padding)
#define ECC_PUBLIC_KEY_SIZE 40    // secp160r1 public key (40 bytes)
#define SHARED_SECRET_SIZE 20     // secp160r1 shared secret

// Debug Configuration
#define DEBUG_MODE true
#define SERIAL_BAUD_RATE 115200

#endif // CONFIG_H
