// Debug configuration for the Okey game
export const DEBUG_CONFIG = {
  // Set to true to enable debug logging
  enabled: false,

  // Debug levels
  levels: {
    FUNCTION_CALLS: true,
    STATE_CHANGES: true,
    GAME_EVENTS: true,
    DRAG_DROP: true,
  },
};

// Debug utility function
export const debugLog = (
  level: keyof typeof DEBUG_CONFIG.levels,
  message: string,
  ...args: any[]
) => {
  if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.levels[level]) {
    console.info(`[DEBUG ${level}] ${message}`, ...args);
  }
};
