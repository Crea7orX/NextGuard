#include "Logger.h"

Logger::Logger() {
    currentLevel = LOG_LEVEL_DEBUG;
}

void Logger::setLevel(LogLevel level) {
    currentLevel = level;
}

String Logger::getLevelString(LogLevel level) {
    switch (level) {
        case LOG_LEVEL_DEBUG:   return "DEBUG";
        case LOG_LEVEL_INFO:    return "INFO";
        case LOG_LEVEL_WARNING: return "WARN";
        case LOG_LEVEL_ERROR:   return "ERROR";
        default:                return "UNKNOWN";
    }
}

String Logger::getTimestamp() {
    return "[" + String(millis()) + "ms]";
}

void Logger::log(LogLevel level, String message) {
    if (level >= currentLevel) {
        String logMessage = getTimestamp() + " [" + getLevelString(level) + "] " + message;
        Serial.println(logMessage);
    }
}

void Logger::debug(String message) {
    log(LOG_LEVEL_DEBUG, message);
}

void Logger::info(String message) {
    log(LOG_LEVEL_INFO, message);
}

void Logger::warning(String message) {
    log(LOG_LEVEL_WARNING, message);
}

void Logger::error(String message) {
    log(LOG_LEVEL_ERROR, message);
}
