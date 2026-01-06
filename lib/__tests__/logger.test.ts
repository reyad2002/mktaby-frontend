import { logger, LogLevel, setLogLevel, getLogLevel } from "../logger";

describe("logger", () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(),
      info: jest.spyOn(console, "info").mockImplementation(),
      warn: jest.spyOn(console, "warn").mockImplementation(),
      error: jest.spyOn(console, "error").mockImplementation(),
      debug: jest.spyOn(console, "debug").mockImplementation(),
    };
    // Reset to debug level for testing
    setLogLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("LogLevel", () => {
    it("should have correct log level values", () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.NONE).toBe(4);
    });
  });

  describe("setLogLevel and getLogLevel", () => {
    it("should set and get log level", () => {
      setLogLevel(LogLevel.WARN);
      expect(getLogLevel()).toBe(LogLevel.WARN);

      setLogLevel(LogLevel.ERROR);
      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe("logger.debug", () => {
    it("should log debug messages when level is DEBUG", () => {
      setLogLevel(LogLevel.DEBUG);
      logger.debug("Debug message", { data: "test" });

      expect(consoleSpy.debug).toHaveBeenCalledWith("[DEBUG] Debug message", {
        data: "test",
      });
    });

    it("should not log debug messages when level is INFO", () => {
      setLogLevel(LogLevel.INFO);
      logger.debug("Debug message");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe("logger.info", () => {
    it("should log info messages when level is INFO or lower", () => {
      setLogLevel(LogLevel.INFO);
      logger.info("Info message");

      expect(consoleSpy.info).toHaveBeenCalledWith("[INFO] Info message");
    });

    it("should not log info messages when level is WARN", () => {
      setLogLevel(LogLevel.WARN);
      logger.info("Info message");

      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe("logger.warn", () => {
    it("should log warn messages when level is WARN or lower", () => {
      setLogLevel(LogLevel.WARN);
      logger.warn("Warning message");

      expect(consoleSpy.warn).toHaveBeenCalledWith("[WARN] Warning message");
    });

    it("should not log warn messages when level is ERROR", () => {
      setLogLevel(LogLevel.ERROR);
      logger.warn("Warning message");

      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });
  });

  describe("logger.error", () => {
    it("should log error messages when level is ERROR or lower", () => {
      setLogLevel(LogLevel.ERROR);
      const error = new Error("Test error");
      logger.error("Error message", error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR] Error message",
        error
      );
    });

    it("should not log error messages when level is NONE", () => {
      setLogLevel(LogLevel.NONE);
      logger.error("Error message");

      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe("log level filtering", () => {
    it("should respect log level hierarchy", () => {
      setLogLevel(LogLevel.WARN);

      logger.debug("Debug");
      logger.info("Info");
      logger.warn("Warn");
      logger.error("Error");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });
});
