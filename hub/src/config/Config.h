#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// Device Configuration
#define DEVICE_ID "WT32-ETH01-001"
#define FIRMWARE_VERSION "1.0.0"

// Network Configuration
#define HOSTNAME "wt32-eth01"
#define DHCP_ENABLED true

// Static IP Configuration (used if DHCP_ENABLED is false)
#define STATIC_IP "192.168.1.100"
#define GATEWAY "192.168.1.1"
#define SUBNET "255.255.255.0"
#define DNS_PRIMARY "8.8.8.8"
#define DNS_SECONDARY "8.8.4.4"

// WebSocket Configuration
#define WEBSOCKET_ENABLED true
#define WEBSOCKET_SERVER "ws://your-server.com"
#define WEBSOCKET_PORT 8080
#define WEBSOCKET_PATH "/ws"
#define WEBSOCKET_RECONNECT_INTERVAL 5000  // 5 seconds

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

// Debug Configuration
#define DEBUG_MODE true
#define SERIAL_BAUD_RATE 115200

#endif // CONFIG_H
