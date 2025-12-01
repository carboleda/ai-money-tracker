import { DeviceInfo } from "../deviceInfo";

describe("DeviceInfo", () => {
  // Mock navigator and screen objects
  const originalNavigator = global.navigator;
  const originalScreen = global.screen;
  const originalWindow = global.window;

  beforeEach(() => {
    // Ensure window is defined for tests
    (global as any).window = {};
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    Object.defineProperty(global, "screen", {
      value: originalScreen,
      writable: true,
    });
    (global as any).window = originalWindow;
  });

  const mockNavigatorAndScreen = (
    userAgent: string,
    platform: string = "MacIntel",
    screenWidth: number = 1440,
    screenHeight: number = 900,
    colorDepth: number = 24,
    deviceMemory?: number,
    hardwareConcurrency?: number
  ) => {
    const mockNavigator = {
      userAgent,
      platform,
      deviceMemory,
      hardwareConcurrency,
    };

    const mockScreen = {
      width: screenWidth,
      height: screenHeight,
      colorDepth,
    };

    Object.defineProperty(global, "navigator", {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "screen", {
      value: mockScreen,
      writable: true,
      configurable: true,
    });
  };

  describe("iPhone detection", () => {
    it("should detect iPhone and set deviceType to smartphone", async () => {
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("smartphone");
      expect(device.osName).toBe("iPhone");
      expect(device.os).toBe("iOS");
      expect(device.browserName).toBe("Safari");
      expect(device.browser).toBe("Safari");
      expect(device.deviceName).toContain("Safari");
      expect(device.deviceName).toContain("iPhone");
    });

    it("should generate consistent deviceId for same iPhone", async () => {
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
      mockNavigatorAndScreen(userAgent, "MacIntel", 1440, 900, 24, 6, 6);

      const device1 = await DeviceInfo.generate();
      const device2 = await DeviceInfo.generate();

      expect(device1.deviceId).toBe(device2.deviceId);
    });
  });

  describe("iPad detection", () => {
    it("should detect iPad and set deviceType to tablet", async () => {
      const userAgent =
        "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("tablet");
      expect(device.osName).toBe("iPad OS");
      expect(device.os).toBe("iOS");
      expect(device.browserName).toBe("Safari");
      expect(device.deviceName).toContain("iPad OS");
    });
  });

  describe("Android smartphone detection", () => {
    it("should detect Android smartphone with small screen", async () => {
      const userAgent =
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36";
      mockNavigatorAndScreen(userAgent, "Linux", 412, 915, 24, 8, 8);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("smartphone");
      expect(device.osName).toBe("Android");
      expect(device.os).toBe("Android");
      expect(device.browserName).toBe("Chrome");
      expect(device.browser).toBe("Chrome");
    });
  });

  describe("Android tablet detection", () => {
    it("should detect Android tablet with large screen", async () => {
      const userAgent =
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      mockNavigatorAndScreen(userAgent, "Linux", 1024, 768, 24, 8, 8);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("tablet");
      expect(device.osName).toBe("Android");
      expect(device.os).toBe("Android");
    });
  });

  describe("macOS desktop detection", () => {
    it("should detect macOS desktop and set deviceType to desktop", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      mockNavigatorAndScreen(userAgent, "MacIntel", 1440, 900, 24, 16, 8);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("desktop");
      expect(device.osName).toBe("macOS");
      expect(device.os).toBe("macOS");
      expect(device.browserName).toBe("Chrome");
      expect(device.browser).toBe("Chrome");
      expect(device.deviceName).toBe("Chrome on macOS");
    });

    it("should detect Safari on macOS", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Safari");
      expect(device.browser).toBe("Safari");
      expect(device.deviceName).toBe("Safari on macOS");
    });

    it("should detect Edge on macOS", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Edge");
      expect(device.browser).toBe("Edge");
    });
  });

  describe("Windows desktop detection", () => {
    it("should detect Windows desktop", async () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      mockNavigatorAndScreen(userAgent, "Win32", 1920, 1080, 24, 16, 12);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("desktop");
      expect(device.osName).toBe("Windows");
      expect(device.os).toBe("Windows");
      expect(device.deviceName).toBe("Chrome on Windows");
    });

    it("should detect Firefox on Windows", async () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Firefox");
      expect(device.browser).toBe("Firefox");
      expect(device.deviceName).toBe("Firefox on Windows");
    });
  });

  describe("Linux desktop detection", () => {
    it("should detect Linux desktop", async () => {
      const userAgent =
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      mockNavigatorAndScreen(userAgent, "Linux", 1366, 768, 24, 8, 4);

      const device = await DeviceInfo.generate();

      expect(device.deviceType).toBe("desktop");
      expect(device.osName).toBe("Linux");
      expect(device.os).toBe("Linux");
      expect(device.deviceName).toBe("Chrome on Linux");
    });
  });

  describe("Unknown browser/OS fallback", () => {
    it("should handle unknown browser", async () => {
      const userAgent = "CustomBrowser/1.0";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Unknown");
      expect(device.browser).toBe("Unknown");
    });

    it("should handle unknown OS", async () => {
      const userAgent = "CustomOS/1.0";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.osName).toBe("Unknown");
      expect(device.os).toBe("Unknown");
    });
  });

  describe("Device ID consistency", () => {
    it("should generate same deviceId for same hardware fingerprint", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      const platform = "MacIntel";
      const width = 1440;
      const height = 900;

      mockNavigatorAndScreen(userAgent, platform, width, height, 24, 16, 8);
      const device1 = await DeviceInfo.generate();

      mockNavigatorAndScreen(userAgent, platform, width, height, 24, 16, 8);
      const device2 = await DeviceInfo.generate();

      expect(device1.deviceId).toBe(device2.deviceId);
    });

    it("should generate same deviceId despite screen resolution changes (device rotation)", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

      mockNavigatorAndScreen(userAgent, "MacIntel", 1440, 900, 24, 16, 8);
      const device1 = await DeviceInfo.generate();

      mockNavigatorAndScreen(userAgent, "MacIntel", 1920, 1080, 24, 16, 8);
      const device2 = await DeviceInfo.generate();

      expect(device1.deviceId).toBe(device2.deviceId);
    });

    it("should generate different deviceId for different deviceMemory", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

      mockNavigatorAndScreen(userAgent, "MacIntel", 1440, 900, 24, 4, 8);
      const device1 = await DeviceInfo.generate();

      mockNavigatorAndScreen(userAgent, "MacIntel", 1440, 900, 24, 16, 8);
      const device2 = await DeviceInfo.generate();

      expect(device1.deviceId).not.toBe(device2.deviceId);
    });

    it("should generate different deviceId for different browser (userAgent)", async () => {
      const userAgent1 =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      const userAgent2 =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";

      mockNavigatorAndScreen(userAgent1, "MacIntel", 1440, 900, 24, 16, 8);
      const device1 = await DeviceInfo.generate();

      mockNavigatorAndScreen(userAgent2, "MacIntel", 1440, 900, 24, 16, 8);
      const device2 = await DeviceInfo.generate();

      expect(device1.deviceId).not.toBe(device2.deviceId);
    });
  });

  describe("Device ID immutability across conditions", () => {
    it("should maintain same deviceId despite user traveling (different timezone)", async () => {
      // Simulating device before and after travel - hardware unchanged
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
      const platform = "iPhone";
      const width = 390;
      const height = 844;

      mockNavigatorAndScreen(userAgent, platform, width, height, 24, 6, 6);
      const deviceBeforeTravel = await DeviceInfo.generate();

      // Timezone and language would change, but hardware stays the same
      mockNavigatorAndScreen(userAgent, platform, width, height, 24, 6, 6);
      const deviceAfterTravel = await DeviceInfo.generate();

      expect(deviceBeforeTravel.deviceId).toBe(deviceAfterTravel.deviceId);
    });
  });

  describe("User-Agent edge cases", () => {
    it("should handle missing navigator properties gracefully", async () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.deviceId).toBeDefined();
      expect(device.deviceId.length).toBeGreaterThan(0); // Check hash is not empty
      expect(device.deviceType).toBeDefined();
      expect(device.deviceName).toBeDefined();
    });
  });

  describe("Opera browser detection", () => {
    it("should detect Opera with OPR/ in user agent", async () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Opera");
      expect(device.browser).toBe("Opera");
      expect(device.deviceName).toBe("Opera on Windows");
    });

    it("should detect Opera with Opera/ in user agent", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Opera/107.0.0.0";
      mockNavigatorAndScreen(userAgent);

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Opera");
      expect(device.browser).toBe("Opera");
    });
  });

  describe("Brave browser detection", () => {
    it("should detect Brave browser", async () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      mockNavigatorAndScreen(userAgent);

      // Mock navigator.brave property
      Object.defineProperty(navigator, "brave", {
        value: { isBrave: true },
        writable: true,
        configurable: true,
      });

      const device = await DeviceInfo.generate();

      expect(device.browserName).toBe("Brave");
      expect(device.browser).toBe("Brave");
      expect(device.deviceName).toBe("Brave on macOS");

      // Clean up
      Object.defineProperty(navigator, "brave", {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });
  });
});
