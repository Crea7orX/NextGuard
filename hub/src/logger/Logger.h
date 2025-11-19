#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>
#include <config/Config.h>

enum LogLevel {
    LOG_LEVEL_DEBUG,
    LOG_LEVEL_INFO,
    LOG_LEVEL_WARNING,
    LOG_LEVEL_ERROR
};

class Logger {
private:
    LogLevel currentLevel;
    
    String getLevelString(LogLevel level);
    String getTimestamp();

public:
    Logger();
    
    void setLevel(LogLevel level);
    void debug(String message);
    void info(String message);
    void warning(String message);
    void error(String message);
    void log(LogLevel level, String message);
};

#endif // LOGGER_H
