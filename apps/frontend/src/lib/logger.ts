const logToBackend = async (message: string, level = "info") => {
  try {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, level }),
    });
  } catch (error) {
    console.error("Failed to send log to backend:", error);
  }
};

const logger = {
  info: (message: string) => logToBackend(message, "info"),
  error: (message: string) => logToBackend(message, "error"),
  warn: (message: string) => logToBackend(message, "warn"),
};

logger.info("Logger initialized");
export default logger;
