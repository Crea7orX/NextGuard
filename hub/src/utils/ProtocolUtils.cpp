#include "ProtocolUtils.h"

void ProtocolUtils::printUUID(const uint8_t* uuid) {
    for (int i = 0; i < UUID_SIZE; i++) {
        if (uuid[i] < 0x10) Serial.print('0');
        Serial.print(uuid[i], HEX);
        if (i == 3 || i == 5 || i == 7 || i == 9) Serial.print('-');
    }
}
