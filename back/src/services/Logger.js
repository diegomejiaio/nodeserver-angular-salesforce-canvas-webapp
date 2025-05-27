/**
 * Logger Service
 * Centralized logging with different levels
 * Follows Single Responsibility Principle
 */
class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        this.currentLevel = this.levels.DEBUG; // Can be configured
    }

    error(message, ...args) {
        if (this.currentLevel >= this.levels.ERROR) {
            console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        if (this.currentLevel >= this.levels.WARN) {
            console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
        }
    }

    info(message, ...args) {
        if (this.currentLevel >= this.levels.INFO) {
            console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
        }
    }

    debug(message, ...args) {
        if (this.currentLevel >= this.levels.DEBUG) {
            console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
        }
    }

    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.currentLevel = this.levels[level];
        }
    }
}

module.exports = new Logger();
