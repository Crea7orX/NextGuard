#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <uECC.h>
#include <EEPROM.h>
#include <avr/wdt.h>
#include <AES.h>
#include <SHA256.h>

// Debug mode - set to 0 for production (no serial output)
#define DEBUG 1

// Node Serial ID
const uint8_t SERIAL_ID[16] = {
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x40, 0x75,
  0xa0, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00
};

// LoRa pins for Pro Mini
#define RFM95_CS 10
#define RFM95_RST A0
#define RFM95_DIO0 2

// Other pins
#define BTN_PIN 4
#define LED_PIN 13
#define SIREN_PIN 8
#define VBAT_PIN A1
#define DIV_PIN 3

// Battery voltage divider values
#define RTOP 1000000.0
#define RBOT 330000.0
#define SCALE ((RTOP + RBOT) / RBOT)
#define VREF 1.100

// Protocol
#define MSG_ADOPT_REQ 0x01
#define MSG_ADOPT_RSP 0x02
#define MSG_DATA 0x10
#define MSG_COMMAND 0x20
#define MSG_DISCOVERY 0x03 // Discovery packet for non-adopted nodes
#define MSG_DISCOVERY_ACK 0x04 // Discovery ACK from hub
#define MSG_CHALLENGE 0x05 // Challenge for counter sync
#define MSG_CHALLENGE_RSP 0x06 // Challenge response

#define FREQ 868E6

#define EE_MAGIC 0xAB12
#define EE_MAGIC_ADDR 0
#define EE_PRIV_ADDR 2
#define EE_KEY_ADDR 23 // 2 + 21 bytes for private key

// State
uint8_t privKey[21]; // secp160r1 = 20 bytes + 1 for alignment
uint8_t sessionKey[16];

bool adopted = false;

uint32_t txCounter = 0; // Counter for data sent to hub
uint32_t rxCounter = 0; // Expected counter for commands from hub
uint32_t lastRxCounter = 0xFFFFFFFF; // Last received counter
uint8_t challengeNonce[8]; // Nonce for challenge-response

bool countersSynced = false; // Flag to track if counters are synced after boot
bool discoveryAcked = false; // Flag to track if hub acknowledged discovery
bool sirenState = false; // Current siren state (on/off)
bool transmitting = false; // Lock to prevent simultaneous transmissions
bool pendingResponse = false; // Flag for deferred response
char pendingMsg[16]; // Buffer for deferred response

unsigned long lastSend = 0;
bool btnDown = false;

AES128 aes;

// Debug prints - using macros for better optimization
#if DEBUG
  #define DEBUG_PRINT(x) Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
  #define DEBUG_PRINTF(x, y) Serial.print(x, y)
  #define DEBUG_PRINT_HEX(label, data, len) \
    do { \
      Serial.print(label); \
      for (int i = 0; i < (len) && i < 8; i++) { \
        if ((data)[i] < 16) Serial.print('0'); \
        Serial.print((data)[i], HEX); \
      } \
      if ((len) > 8) Serial.print(F("...")); \
      Serial.println(); \
    } while(0)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
  #define DEBUG_PRINTF(x, y)
  #define DEBUG_PRINT_HEX(label, data, len)
#endif

void blink(int n, int d = 100) {
  for (int i = 0; i < n; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(d);
    digitalWrite(LED_PIN, LOW);
    delay(d);
  }
}

uint16_t readBatteryMillivolts() {
  // Activate divider by connecting it to ground
  pinMode(DIV_PIN, OUTPUT);
  digitalWrite(DIV_PIN, LOW);
  
  // Switch to internal 1.1V reference for better accuracy
  analogReference(INTERNAL);
  delay(3);                     // Let reference stabilize
  analogRead(VBAT_PIN);         // Discard first reading
  delay(5);                     // Let divider settle
  
  // Take 8 averaged readings for stability
  uint32_t sum = 0;
  for (int i = 0; i < 8; i++) {
    sum += analogRead(VBAT_PIN);
  }
  
  // Deactivate divider to save power
  pinMode(DIV_PIN, INPUT);
  
  // Calculate voltage
  float adc = sum / 8.0;
  float voltage = (adc / 1023.0) * VREF * SCALE;
  
  return (uint16_t)(voltage * 1000.0);  // Return in millivolts
}

uint8_t getBatteryPercentage() {
  uint16_t mV = readBatteryMillivolts();
  
  if (mV >= 4200) return 100;
  if (mV >= 4100) return 90;
  if (mV >= 4000) return 80;
  if (mV >= 3900) return 70;
  if (mV >= 3800) return 60;
  if (mV >= 3700) return 50;
  if (mV >= 3600) return 40;
  if (mV >= 3500) return 30;
  if (mV >= 3400) return 20;
  if (mV >= 3300) return 10;
  if (mV >= 3200) return 5;
  return 0;
}

int getRng(uint8_t *d, unsigned s) {
  for (unsigned i = 0; i < s; i++) {
    d[i] = random(256);
  }
  return 1;
}

// HMAC-SHA256 for packet authentication
void computeHMAC(uint8_t* key, size_t keyLen, uint8_t* data, size_t dataLen, uint8_t* hmac) {
  SHA256 sha256;
  
  // HMAC = SHA256((key XOR opad) || SHA256((key XOR ipad) || message))
  uint8_t ipad[64];
  uint8_t opad[64];
  uint8_t keyBlock[64];
  
  // Prepare key block (pad or hash if needed)
  memset(keyBlock, 0, 64);
  if (keyLen <= 64) {
    memcpy(keyBlock, key, keyLen);
  } else {
    sha256.reset();
    sha256.update(key, keyLen);
    sha256.finalize(keyBlock, 32);
  }
  
  // Create ipad and opad
  for (int i = 0; i < 64; i++) {
    ipad[i] = keyBlock[i] ^ 0x36;
    opad[i] = keyBlock[i] ^ 0x5C;
  }
  
  // Inner hash: SHA256((key XOR ipad) || message)
  uint8_t innerHash[32];
  sha256.reset();
  sha256.update(ipad, 64);
  sha256.update(data, dataLen);
  sha256.finalize(innerHash, 32);
  
  // Outer hash: SHA256((key XOR opad) || innerHash)
  sha256.reset();
  sha256.update(opad, 64);
  sha256.update(innerHash, 32);
  sha256.finalize(hmac, 32);
}

bool verifyHMAC(uint8_t* key, size_t keyLen, uint8_t* data, size_t dataLen, uint8_t* receivedHmac) {
  uint8_t computedHmac[32];
  computeHMAC(key, keyLen, data, dataLen, computedHmac);
  
  // Constant-time comparison to prevent timing attacks
  uint8_t result = 0;
  for (int i = 0; i < 32; i++) {
    result |= computedHmac[i] ^ receivedHmac[i];
  }
  
  return result == 0;
}

void saveKeys() {
  DEBUG_PRINTLN(F("[N] Saving..."));
  EEPROM.put(EE_MAGIC_ADDR, (uint16_t)EE_MAGIC);
  
  for (int i = 0; i < 21; i++) 
    EEPROM.write(EE_PRIV_ADDR + i, privKey[i]);
  
  for (int i = 0; i < 16; i++)
    EEPROM.write(EE_KEY_ADDR + i, sessionKey[i]);
}

bool load() {
  uint16_t m;
  EEPROM.get(EE_MAGIC_ADDR, m);
  
  if (m != EE_MAGIC) {
    DEBUG_PRINTLN(F("[N] No save"));
    return false;
  }
  
  for (int i = 0; i < 21; i++)
    privKey[i] = EEPROM.read(EE_PRIV_ADDR + i);
  
  for (int i = 0; i < 16; i++)
    sessionKey[i] = EEPROM.read(EE_KEY_ADDR + i);
  
  DEBUG_PRINT(F("[N] Loaded UUID: "));
  for (int i = 0; i < 16; i++) {
    if (SERIAL_ID[i] < 0x10) DEBUG_PRINT('0');
    DEBUG_PRINTF(SERIAL_ID[i], HEX);
    if (i == 3 || i == 5 || i == 7 || i == 9) DEBUG_PRINT('-');
  }
  DEBUG_PRINTLN();
  DEBUG_PRINT_HEX(F("[N] Key:"), sessionKey, 16);
  
  return true;
}

void clear() {
  DEBUG_PRINTLN(F("[N] CLEAR!"));
  EEPROM.put(EE_MAGIC_ADDR, (uint16_t)0);
  adopted = false;
  blink(5, 50);
}

void sendData(const char* msg) {
  if (!adopted) {
    DEBUG_PRINTLN(F("[N] Not adopted!"));
    return;
  }
  
  // Check if already transmitting to prevent re-entrancy
  if (transmitting) {
    DEBUG_PRINTLN(F("[N] TX busy, dropped"));
    return;
  }
  
  transmitting = true; // Set lock
  LoRa.idle(); // Ensure LoRa is not in RX mode
  
  int len = strlen(msg);
  DEBUG_PRINT(F("[N] Send:"));
  DEBUG_PRINTLN(msg);
  
  // Pad to 16 byte boundary
  int paddedLen = ((len + 15) / 16) * 16;
  uint8_t plaintext[64];
  memset(plaintext, 0, paddedLen);
  memcpy(plaintext, msg, len);
  plaintext[len] = 0x80; // Padding marker
  
  // Prepare IV (SERIAL_ID + counter32 + nonce)
  uint8_t iv[16];
  memset(iv, 0, 16);
  memcpy(iv, SERIAL_ID, 4);  // Use first 4 bytes of UUID for IV
  memcpy(iv + 4, &txCounter, 4);  // 32-bit counter
  // Generate random nonce for remaining 8 bytes
  uint8_t nonce[8];
  for (int i = 0; i < 8; i++) {
    nonce[i] = random(256);
    iv[i + 8] = nonce[i];
  }
  
  // Set key
  aes.setKey(sessionKey, 16);
  
  // Encrypt blocks (CBC mode)
  uint8_t ciphertext[64];
  uint8_t tempBlock[16];
  
  for (int i = 0; i < paddedLen; i += 16) {
    // XOR plaintext with IV for CBC mode
    for (int j = 0; j < 16; j++) {
      tempBlock[j] = plaintext[i + j] ^ iv[j];
    }
    // Encrypt block
    aes.encryptBlock(ciphertext + i, tempBlock);
    // Use ciphertext as IV for next block
    memcpy(iv, ciphertext + i, 16);
  }
  
  // Build packet: type + SERIAL_ID + counter32 + nonce(8) + origLen + ciphertext + hmac(32)
  uint8_t pkt[136];  // Increased from 124 to accommodate 16-byte UUID
  pkt[0] = MSG_DATA;
  memcpy(pkt + 1, SERIAL_ID, 16);     // 16-byte UUID
  memcpy(pkt + 17, &txCounter, 4);  // 32-bit counter
  memcpy(pkt + 21, nonce, 8);       // 8-byte nonce
  pkt[29] = (uint8_t)len;
  memcpy(pkt + 30, ciphertext, paddedLen);
  
  // Compute HMAC over the entire packet (except HMAC itself)
  // HMAC covers: type + SERIAL_ID + counter + nonce + origLen + ciphertext
  size_t hmacDataLen = 30 + paddedLen;
  uint8_t hmac[32];
  computeHMAC(sessionKey, 16, pkt, hmacDataLen, hmac);
  memcpy(pkt + hmacDataLen, hmac, 32);
  
  txCounter++;  // Increment counter
  
  // Reset watchdog before transmission
  wdt_reset();
  
  LoRa.beginPacket();
  LoRa.write(pkt, hmacDataLen + 32);  // Include HMAC in transmission
  
  // Use non-blocking endPacket with timeout
  bool sent = LoRa.endPacket(false);  // Non-blocking mode
  unsigned long txStart = millis();
  while (!sent && (millis() - txStart < 2000)) {  // 2 second timeout
    wdt_reset();
    delay(10);
  }
  
  if (sent || (millis() - txStart >= 2000)) {
    if (sent) {
      DEBUG_PRINTLN(F("[N] Encrypted sent"));
    } else {
      DEBUG_PRINTLN(F("[N] TX timeout!"));
    }
  }
  
  transmitting = false; // Release lock
  LoRa.receive();
  blink(1);
  wdt_reset();
}

void sendDiscovery() {
  // Send discovery packet: type + SERIAL_ID (16 bytes)
  uint8_t pkt[17];  // 1 + 16
  pkt[0] = MSG_DISCOVERY;
  memcpy(pkt + 1, SERIAL_ID, 16);
  
  wdt_reset();  // Reset watchdog before transmission
  
  LoRa.beginPacket();
  LoRa.write(pkt, 17);
  if (LoRa.endPacket()) {
    DEBUG_PRINT(F("[N] Discovery sent (UUID: "));
    // Print UUID in formatted style
    for (int i = 0; i < 16; i++) {
      if (SERIAL_ID[i] < 0x10) DEBUG_PRINT('0');
      DEBUG_PRINTF(SERIAL_ID[i], HEX);
      if (i == 3 || i == 5 || i == 7 || i == 9) DEBUG_PRINT('-');
    }
    DEBUG_PRINTLN(F(")"));
  }
  
  LoRa.receive();
}

void sendChallenge() {
  // Generate random nonce for challenge
  for (int i = 0; i < 8; i++) {
    challengeNonce[i] = random(256);
  }
  
  // Build challenge packet: type + SERIAL_ID + txCounter + rxCounter + nonce + HMAC
  uint8_t pkt[65];  // 1 + 16 + 4 + 4 + 8 + 32(HMAC)
  pkt[0] = MSG_CHALLENGE;
  memcpy(pkt + 1, SERIAL_ID, 16);
  memcpy(pkt + 17, &txCounter, 4);
  memcpy(pkt + 21, &rxCounter, 4);
  memcpy(pkt + 25, challengeNonce, 8);
  
  // Compute HMAC over the packet (except HMAC itself)
  size_t hmacDataLen = 33;  // 1 + 16 + 4 + 4 + 8
  uint8_t hmac[32];
  computeHMAC(sessionKey, 16, pkt, hmacDataLen, hmac);
  memcpy(pkt + hmacDataLen, hmac, 32);
  
  DEBUG_PRINT(F("[N] Challenge HMAC: "));
  for (int i = 0; i < 8; i++) {
    if (hmac[i] < 0x10) DEBUG_PRINT('0');
    DEBUG_PRINTF(hmac[i], HEX);
  }
  DEBUG_PRINTLN(F("..."));
  
  wdt_reset();  // Reset watchdog before transmission
  
  LoRa.beginPacket();
  LoRa.write(pkt, 65);  // Send with HMAC
  if (LoRa.endPacket()) {
    DEBUG_PRINT(F("[N] Challenge sent - TX: "));
    DEBUG_PRINT(txCounter);
    DEBUG_PRINT(F(", RX: "));
    DEBUG_PRINT(rxCounter);
    DEBUG_PRINT(F(", Nonce: "));
    for (int i = 0; i < 4; i++) {
      if (challengeNonce[i] < 0x10) DEBUG_PRINT('0');
      DEBUG_PRINTF(challengeNonce[i], HEX);
    }
    DEBUG_PRINTLN(F("..."));
  }
  
  LoRa.receive();
}

void sendAdopt() {
  DEBUG_PRINTLN(F("[N] Adopt req..."));
  
  // Generate fresh keys for each adoption attempt
  DEBUG_PRINTLN(F("[N] Gen fresh keys..."));
  uECC_set_rng(&getRng);
  
  // Reset watchdog before key generation (can take time)
  wdt_reset();
  
  uint8_t pubKey[40];
  if (!uECC_make_key(pubKey, privKey, uECC_secp160r1())) {
    DEBUG_PRINTLN(F("[N] Key gen FAIL!"));
    return;
  }
  
  wdt_reset();  // Reset after key generation
  
  DEBUG_PRINT_HEX(F("[N] NewPriv:"), privKey, 20);
  DEBUG_PRINT_HEX(F("[N] NewPub:"), pubKey, 40);
  
  // Send FULL public key: type + SERIAL_ID + pubKey(40 bytes)
  uint8_t pkt[57];  // 1 + 16 + 40
  pkt[0] = MSG_ADOPT_REQ;
  memcpy(pkt + 1, SERIAL_ID, 16);  // 16-byte UUID
  memcpy(pkt + 17, pubKey, 40); // Full public key
  
  DEBUG_PRINT(F("[N] Pkt size: "));
  DEBUG_PRINTLN((int)sizeof(pkt));
  
  LoRa.beginPacket();
  LoRa.write(pkt, 57);
  if (LoRa.endPacket()) {
    DEBUG_PRINTLN(F("[N] Sent OK"));
  } else {
    DEBUG_PRINTLN(F("[N] Send FAIL!"));
  }
  
  // Go back to receive mode
  LoRa.receive();
  
  blink(3, 50);
}

void handleAdopt(uint8_t* p, int len) {
  if (len < 58) {  // 1 + 16 + 1 + 40
    DEBUG_PRINTLN(F("[N] Bad rsp"));
    return;
  }
  
  // Compare 16-byte UUID
  if (memcmp(p + 1, SERIAL_ID, 16) != 0) {
    DEBUG_PRINTLN(F("[N] Wrong UUID"));
    return;
  }
  
  if (p[17] != 1) {
    DEBUG_PRINTLN(F("[N] Rejected"));
    return;
  }
  
  DEBUG_PRINTLN(F("[N] ADOPTED!"));
  
  uint8_t hubPub[40];
  memcpy(hubPub, p + 18, 40);  // Full public key
  
  DEBUG_PRINT_HEX(F("[N] HubPub:"), hubPub, 20);
  
  // Reset watchdog before ECDH
  wdt_reset();
  
  // ECDH shared secret
  uint8_t secret[20];
  if (!uECC_shared_secret(hubPub, privKey, secret, uECC_secp160r1())) {
    DEBUG_PRINTLN(F("[N] ECDH FAIL!"));
    return;
  }
  
  DEBUG_PRINT_HEX(F("[N] Secret:"), secret, 20);
  
  // KDF: XOR fold to 16 bytes
  for (int i = 0; i < 16; i++) {
    sessionKey[i] = secret[i] ^ secret[(i + 4) % 20];
  }
  
  DEBUG_PRINT_HEX(F("[N] Session:"), sessionKey, 16);
  
  adopted = true;
  saveKeys();
  blink(10, 100);
}

void handleCommand(uint8_t* p, int len) {
  if (len < 63) {  // 1 + 16 + 4 + 8 + 1 + 16(min) + 32(hmac)
    DEBUG_PRINTLN(F("[N] Bad cmd size"));
    return;
  }
  
  // Compare 16-byte UUID
  if (memcmp(p + 1, SERIAL_ID, 16) != 0) {
    DEBUG_PRINTLN(F("[N] Cmd wrong UUID"));
    return;
  }
  
  // Verify HMAC first (last 32 bytes of packet)
  size_t hmacDataLen = len - 32;
  uint8_t* receivedHmac = p + hmacDataLen;
  
  if (!verifyHMAC(sessionKey, 16, p, hmacDataLen, receivedHmac)) {
    DEBUG_PRINTLN(F("[N] HMAC FAIL!"));
    return;
  }
  
  DEBUG_PRINTLN(F("[N] HMAC OK"));
  
  // Read 32-bit counter
  uint32_t counter;
  memcpy(&counter, p + 17, 4);
  
  // Read 8-byte nonce
  uint8_t nonce[8];
  memcpy(nonce, p + 21, 8);
  
  uint8_t origLen = p[29];
  uint8_t* ciphertext = p + 30;
  size_t ciphertextLen = hmacDataLen - 30;  // Exclude HMAC from ciphertext length
  
  // Counter validation (prevent replay attacks)
  if (counter < rxCounter) {
    DEBUG_PRINTLN(F("[N] Replay!"));
    return;
  }
  
  if (counter == lastRxCounter) {
    DEBUG_PRINTLN(F("[N] Duplicate!"));
    return;
  }
  
  DEBUG_PRINT(F("[N] Counter:"));
  DEBUG_PRINTLN(counter);
  
  // Prepare IV (SERIAL_ID + counter32 + nonce from packet)
  uint8_t iv[16];
  memset(iv, 0, 16);
  memcpy(iv, SERIAL_ID, 4);  // Use first 4 bytes of UUID for IV
  memcpy(iv + 4, &counter, 4);  // 32-bit counter
  memcpy(iv + 8, nonce, 8);     // 8-byte nonce from packet
  
  // Reset watchdog before decryption
  wdt_reset();
  
  // Set key
  aes.setKey(sessionKey, 16);
  
  // Decrypt blocks (CBC mode)
  uint8_t plaintext[64];
  uint8_t tempBlock[16];
  
  for (size_t i = 0; i < ciphertextLen; i += 16) {
    // Decrypt block
    aes.decryptBlock(tempBlock, ciphertext + i);
    // XOR with IV (previous ciphertext block)
    for (int j = 0; j < 16; j++) {
      plaintext[i + j] = tempBlock[j] ^ iv[j];
    }
    // Save current ciphertext as IV for next block
    memcpy(iv, ciphertext + i, 16);
  }
  
  // Update counters after successful decryption
  lastRxCounter = counter;
  rxCounter = counter + 1;
  
  // Null terminate
  plaintext[origLen] = 0;
  
  DEBUG_PRINT(F("[N] Command: "));
  DEBUG_PRINTLN((char*)plaintext);
  
  // Execute command
  if (strncmp((char*)plaintext, "siren;", 6) == 0) {
    if (strcmp((char*)plaintext + 6, "true") == 0) {
      DEBUG_PRINTLN(F("[N] SIREN ON"));
      digitalWrite(SIREN_PIN, HIGH);
      sirenState = true;
      // Defer response to avoid recursion
      strcpy(pendingMsg, "siren;true");
      pendingResponse = true;
    } else if (strcmp((char*)plaintext + 6, "false") == 0) {
      DEBUG_PRINTLN(F("[N] SIREN OFF"));
      digitalWrite(SIREN_PIN, LOW);
      sirenState = false;
      // Defer response to avoid recursion
      strcpy(pendingMsg, "siren;false");
      pendingResponse = true;
    } else {
      DEBUG_PRINTLN(F("[N] Invalid siren value"));
    }
  } else {
    DEBUG_PRINTLN(F("[N] Unknown command"));
  }
}

void handleDiscoveryAck(uint8_t* p, int len) {
  if (len < 17) { // 1 + 16
    DEBUG_PRINTLN(F("[N] Bad discovery ack"));
    return;
  }
  
  // Verify it's for our node
  if (memcmp(p + 1, SERIAL_ID, 16) != 0) {
    DEBUG_PRINTLN(F("[N] Wrong UUID in discovery ack"));
    return;
  }
  
  DEBUG_PRINTLN(F("[N] Discovery ACK received - stopping discovery"));
  discoveryAcked = true; // Stop sending discovery packets
  blink(2);
}

void handleHubChallenge(uint8_t* p, int len) {
  if (len < 61) { // 1 + 16 + 4 + 4 + 8 + 32(HMAC)
    DEBUG_PRINTLN(F("[N] Bad hub challenge"));
    return;
  }
  
  // Verify it's for our node
  if (memcmp(p + 1, SERIAL_ID, 16) != 0) {
    DEBUG_PRINTLN(F("[N] Wrong UUID in hub challenge"));
    return;
  }
  
  // Verify HMAC (last 32 bytes)
  size_t hmacDataLen = len - 32;
  uint8_t* receivedHmac = p + hmacDataLen;
  
  if (!verifyHMAC(sessionKey, 16, p, hmacDataLen, receivedHmac)) {
    DEBUG_PRINTLN(F("[N] Hub challenge HMAC FAIL!"));
    return;
  }
  
  DEBUG_PRINTLN(F("[N] Hub challenge HMAC OK"));
  
  // Extract hub's counters
  uint32_t hubTxCounter, hubRxCounter;
  memcpy(&hubTxCounter, p + 17, 4);
  memcpy(&hubRxCounter, p + 21, 4);
  
  // Extract hub's nonce
  uint8_t hubNonce[8];
  memcpy(hubNonce, p + 25, 8);
  
  DEBUG_PRINT(F("[N] Hub challenge - Hub TX: "));
  DEBUG_PRINT(hubTxCounter);
  DEBUG_PRINT(F(", Hub RX: "));
  DEBUG_PRINTLN(hubRxCounter);
  
  // Sync our TX counter with what hub expects
  if (hubRxCounter != txCounter) {
    DEBUG_PRINT(F("[N] Adjusting TX counter: "));
    DEBUG_PRINT(txCounter);
    DEBUG_PRINT(F(" -> "));
    DEBUG_PRINTLN(hubRxCounter);
    txCounter = hubRxCounter;
  }
  
  // Sync our RX counter with hub's TX
  rxCounter = hubTxCounter;
  lastRxCounter = 0xFFFFFFFF;
  
  // Send response using same MSG_CHALLENGE_RSP message type
  uint8_t pkt[65];  // 1 + 16 + 4 + 4 + 8 + 32(HMAC)
  pkt[0] = MSG_CHALLENGE_RSP;
  memcpy(pkt + 1, SERIAL_ID, 16);
  memcpy(pkt + 17, &txCounter, 4);
  memcpy(pkt + 21, &rxCounter, 4);
  memcpy(pkt + 25, hubNonce, 8);  // Echo back the hub's nonce
  
  // Compute HMAC
  size_t responseHmacDataLen = 33;  // 1 + 16 + 4 + 4 + 8
  uint8_t responseHmac[32];
  computeHMAC(sessionKey, 16, pkt, responseHmacDataLen, responseHmac);
  memcpy(pkt + responseHmacDataLen, responseHmac, 32);
  
  // Send response
  LoRa.beginPacket();
  LoRa.write(pkt, 65);
  if (LoRa.endPacket()) {
    DEBUG_PRINTLN(F("[N] Hub challenge response sent"));
    countersSynced = true;
    blink(2, 100);
  } else {
    DEBUG_PRINTLN(F("[N] Hub challenge response FAIL!"));
  }
  
  LoRa.receive();
}

void handleChallengeResponse(uint8_t* p, int len) {
  if (len < 61) { // 1 + 16 + 4 + 4 + 4 + 32(HMAC)
    DEBUG_PRINTLN(F("[N] Bad challenge rsp"));
    return;
  }
  
  // Verify it's for our node
  if (memcmp(p + 1, SERIAL_ID, 16) != 0) {
    DEBUG_PRINTLN(F("[N] Wrong UUID in rsp"));
    return;
  }
  
  // Verify HMAC (last 32 bytes)
  size_t hmacDataLen = len - 32;
  uint8_t* receivedHmac = p + hmacDataLen;
  
  if (!verifyHMAC(sessionKey, 16, p, hmacDataLen, receivedHmac)) {
    DEBUG_PRINTLN(F("[N] Challenge HMAC FAIL!"));
    return;
  }
  
  DEBUG_PRINTLN(F("[N] Challenge HMAC OK"));
  
  // Extract hub's counters
  uint32_t hubTxCounter, hubRxCounter;
  memcpy(&hubTxCounter, p + 17, 4);
  memcpy(&hubRxCounter, p + 21, 4);
  
  // Verify nonce matches what we sent
  if (memcmp(p + 25, challengeNonce, 8) != 0) {
    DEBUG_PRINTLN(F("[N] Nonce mismatch!"));
    return;
  }
  
  // Sync counters
  rxCounter = hubTxCounter;  // Hub's TX becomes our expected RX
  lastRxCounter = 0xFFFFFFFF;  // Reset duplicate detection
  
  DEBUG_PRINT(F("[N] Counters synced! Our TX: "));
  DEBUG_PRINT(txCounter);
  DEBUG_PRINT(F(", Hub TX (our RX): "));
  DEBUG_PRINT(rxCounter);
  DEBUG_PRINT(F(", Hub RX: "));
  DEBUG_PRINTLN(hubRxCounter);
  
  countersSynced = true;
  blink(3, 50); // Indicate sync success
}

void onRx(int ps) {
  if (ps == 0) return;
  
  uint8_t buf[128];
  int idx = 0;
  
  while (LoRa.available() && idx < 128) {
    buf[idx++] = LoRa.read();
  }
  
  if (idx == 0) return;
  
  DEBUG_PRINT(F("[N] RX RSSI:"));
  DEBUG_PRINTLN(LoRa.packetRssi());
  
  if (buf[0] == MSG_ADOPT_RSP) {
    handleAdopt(buf, idx);
  } else if (buf[0] == MSG_COMMAND) {
    handleCommand(buf, idx);
  } else if (buf[0] == MSG_DISCOVERY_ACK) {
    handleDiscoveryAck(buf, idx);
  } else if (buf[0] == MSG_CHALLENGE) {
    handleHubChallenge(buf, idx);
  } else if (buf[0] == MSG_CHALLENGE_RSP) {
    handleChallengeResponse(buf, idx);
  }
}

int freeRam() {
  extern int __heap_start, *__brkval;
  int v;
  return (int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval);
}

void setup() {
  // Disable watchdog initially
  wdt_disable();
  
#if DEBUG
  Serial.begin(38400);
  delay(1000);
#endif
  
  DEBUG_PRINTLN(F("\n[N] Start"));
  DEBUG_PRINT(F("[N] RAM:"));
  DEBUG_PRINTLN(freeRam());
  
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(SIREN_PIN, OUTPUT);
  digitalWrite(SIREN_PIN, LOW);  // Ensure siren starts off
  pinMode(VBAT_PIN, INPUT);
  pinMode(DIV_PIN, INPUT);
  
  blink(3);
  
  // Read initial battery voltage
  DEBUG_PRINT(F("[N] Battery: "));
  DEBUG_PRINT(readBatteryMillivolts());
  DEBUG_PRINT(F("mV ("));
  DEBUG_PRINT(getBatteryPercentage());
  DEBUG_PRINTLN(F("%)"));
  
  LoRa.setPins(RFM95_CS, RFM95_RST, RFM95_DIO0);
  
  if (!LoRa.begin(FREQ)) {
    DEBUG_PRINTLN(F("[N] LoRa FAIL!"));
    while (1) blink(1, 500);
  }
  
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setSyncWord(0x34);
  
  DEBUG_PRINTLN(F("[N] LoRa OK"));
  DEBUG_PRINT(F("[N] Freq: "));
  DEBUG_PRINT(FREQ / 1E6);
  DEBUG_PRINTLN(F(" MHz"));
  
  if (load()) {
    adopted = true;
    DEBUG_PRINTLN(F("[N] Loaded"));
    blink(5);
  } else {
    // Add delay and print before key gen
    delay(100);
    DEBUG_PRINT(F("[N] RAM before keygen:"));
    DEBUG_PRINTLN(freeRam());
  }
  
  LoRa.onReceive(onRx);
  LoRa.receive();
  
  DEBUG_PRINTLN(F("[N] Ready"));
  DEBUG_PRINT(F("[N] RAM:"));
  DEBUG_PRINTLN(freeRam());
  
  // Send challenge if adopted to sync counters
  if (adopted) {
    delay(500);  // Wait for things to settle
    DEBUG_PRINTLN(F("[N] Sending boot challenge..."));
    sendChallenge();
  }
  
  // Initialize siren state
  sirenState = false;
  DEBUG_PRINTLN(F("[N] Siren initialized: OFF"));
  
  // Enable watchdog timer (8 second timeout)
  wdt_enable(WDTO_8S);
  DEBUG_PRINTLN(F("[N] Watchdog enabled"));
}

void loop() {
  // Reset watchdog at start of each loop iteration
  wdt_reset();
  
  // Handle deferred response
  if (pendingResponse && !transmitting) {
    pendingResponse = false;
    delay(50); // Small delay to avoid collision
    sendData(pendingMsg);
  }
  
  // Button handling
  if (digitalRead(BTN_PIN) == LOW) {
    if (!btnDown) {
      btnDown = true;
      delay(50);
      
      unsigned long t = millis();
      while (digitalRead(BTN_PIN) == LOW) {
        if (millis() - t > 3000) {
          DEBUG_PRINTLN(F("[N] RESET..."));
          clear();
          while (digitalRead(BTN_PIN) == LOW);
          delay(1000);
          asm volatile ("  jmp 0");
        }
      }
      
      if (millis() - t < 3000) {
        if (!adopted) {
          sendAdopt();
        }
      }
    }
  } else {
    btnDown = false;
  }
  
  // Send periodic discovery packets when not adopted (and not yet acknowledged)
  static unsigned long lastDiscovery = 0;
  if (!adopted && !discoveryAcked && (millis() - lastDiscovery > 5000)) {
    lastDiscovery = millis();
    sendDiscovery();
  }
  
  // Resend challenge if not synced yet
  static unsigned long lastChallenge = 0;
  if (adopted && !countersSynced && (millis() - lastChallenge > 5000)) {
    lastChallenge = millis();
    DEBUG_PRINTLN(F("[N] Resending challenge..."));
    sendChallenge();
  }
  
  if (adopted && countersSynced && (millis() - lastSend > 5000)) {
    lastSend = millis();
    
    uint16_t battVoltage = readBatteryMillivolts();
    uint8_t battPercent = getBatteryPercentage();
    
    char m[48];
    snprintf(m, sizeof(m), "telemetry;%u;%u;%s", 
             battVoltage, 
             battPercent,
             sirenState ? "true" : "false");
    sendData(m);
    
    DEBUG_PRINT(F("[N] RAM:"));
    DEBUG_PRINTLN(freeRam());
  }
  
  delay(10);
}