#ifndef FACTORY_RESET_H
#define FACTORY_RESET_H

#include <Arduino.h>
#include <logger/Logger.h>
#include <storage/StorageManager.h>

class FactoryReset {
private:
    Logger* logger;
    StorageManager* storage;
    uint8_t buttonPin;
    unsigned long holdTime;

public:
    FactoryReset();
    
    void begin(Logger* loggerInstance, StorageManager* storageInstance,
               uint8_t pin = 0, unsigned long holdTimeMs = 3000);
    
    // Check if boot button is held for factory reset
    bool checkButtonHeld();
    
    // Perform factory reset (wipe all stored data)
    void performReset();
};

#endif // FACTORY_RESET_H
