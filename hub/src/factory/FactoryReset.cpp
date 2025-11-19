#include "FactoryReset.h"

FactoryReset::FactoryReset() {
    logger = nullptr;
    storage = nullptr;
    buttonPin = 0;
    holdTime = 3000;
}

void FactoryReset::begin(Logger* loggerInstance, StorageManager* storageInstance,
                        uint8_t pin, unsigned long holdTimeMs) {
    logger = loggerInstance;
    storage = storageInstance;
    buttonPin = pin;
    holdTime = holdTimeMs;
}

bool FactoryReset::checkButtonHeld() {
    pinMode(buttonPin, INPUT_PULLUP);
    
    if (logger) {
        logger->info("Checking boot button for factory reset...");
        logger->info("Hold boot button for " + String(holdTime / 1000) + " seconds to wipe keys");
    }
    
    unsigned long startTime = millis();
    bool buttonPressed = false;
    
    // Check if button is pressed initially
    if (digitalRead(buttonPin) == LOW) {
        buttonPressed = true;
        
        if (logger) {
            logger->info("Boot button detected, holding...");
        }
        
        // Wait for the hold time while checking button state
        while (millis() - startTime < holdTime) {
            if (digitalRead(buttonPin) == HIGH) {
                // Button was released
                buttonPressed = false;
                if (logger) {
                    logger->info("Boot button released, continuing normal boot");
                }
                break;
            }
            
            // Show countdown every 500ms
            unsigned long elapsed = millis() - startTime;
            if (elapsed % 500 == 0) {
                Serial.print(".");
            }
            
            delay(10);
        }
        
        if (buttonPressed) {
            Serial.println();
            if (logger) {
                logger->warning("Boot button held for required time!");
            }
            return true;
        }
    } else {
        if (logger) {
            logger->info("Boot button not pressed, continuing normal boot");
        }
    }
    
    return false;
}

void FactoryReset::performReset() {
    if (logger) {
        logger->warning("=== FACTORY RESET ===");
        logger->warning("Wiping stored keys and certificates...");
    }
    
    // Clear all stored preferences
    if (storage) {
        storage->clear();
    }
    
    if (logger) {
        logger->info("Keys wiped successfully!");
        logger->info("Device will restart in 2 seconds...");
    }
    
    delay(2000);
    
    // Restart the device
    ESP.restart();
}
