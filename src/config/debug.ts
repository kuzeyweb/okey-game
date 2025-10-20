// Debug configuration for Okey Game
export const DEBUG_CONFIG = {
  enabled: true, // Set to true to enable debug logging
  logLevel: "info", // 'info', 'warn', 'error'
  logComponents: true, // Log component renders
  logHooks: true, // Log hook executions
  logGameLogic: true, // Log game logic functions
  logDragDrop: true, // Log drag and drop events
};

// Debug logger utility
export const debugLog = (category: string, message: string, data?: any) => {
  if (!DEBUG_CONFIG.enabled) return;

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${category}] ${message}`;

  if (data) {
    console.info(logMessage, data);
  } else {
    console.info(logMessage);
  }
};
