import {
  DeviceData,
  DeviceType,
  OSType,
  BrowserType,
} from "@/interfaces/device";

/**
 * DeviceIdentification utility class for generating unique device identifiers
 * Uses hash-based identification from immutable hardware characteristics
 * Hash is deterministic - same device always generates same ID
 * Survives cache clears, travels, timezone changes, language changes
 */
export class DeviceInfo {
  /**
   * Generates device identification with SHA-256 hash
   * Uses crypto.subtle API for secure hashing
   *
   * @returns Device identification object with deviceId, type, name, and browser info
   */
  static async generate(): Promise<DeviceData> {
    if (globalThis.window === undefined) {
      throw new TypeError(
        "Device identification must be called on client-side only"
      );
    }

    const userAgent = navigator.userAgent || "Unknown";

    // Parse OS and Browser
    const { os, osName } = this.parseOS(userAgent);
    const { browser, browserName } = this.parseBrowser(userAgent);

    // Determine device type
    const deviceType = this.determineDeviceType(
      userAgent,
      screen.width,
      screen.height
    );

    // Generate device name
    const deviceName = `${browserName} on ${osName}`;

    // Collect fingerprint data and generate hash
    const fingerprintData = this.collectFingerprintData();
    const deviceId = await this.sha256(fingerprintData);

    return {
      deviceId,
      deviceType,
      deviceName,
      userAgent,
      osName,
      os,
      browserName,
      browser,
    };
  }

  /**
   * Generates a hash from a string, preferring SHA-256 via SubtleCrypto.
   * SubtleCrypto is only available in secure contexts (HTTPS/localhost), so
   * on iOS Safari it's undefined when testing over plain http:// on a LAN
   * IP - fall back to a deterministic non-cryptographic hash instead of
   * throwing, since this ID is only used for device identification.
   */
  private static async sha256(str: string): Promise<string> {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      } catch (error) {
        console.warn(
          "crypto.subtle.digest failed, falling back to non-cryptographic hash:",
          error
        );
      }
    }
    return this.fallbackHash(str);
  }

  /**
   * Deterministic non-cryptographic hash (two 32-bit rolling hashes
   * combined into a 16-char hex string, "cyrb53"-style) used only when
   * SubtleCrypto is unavailable.
   */
  private static fallbackHash(str: string): string {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (
      (h1 >>> 0).toString(16).padStart(8, "0") +
      (h2 >>> 0).toString(16).padStart(8, "0")
    );
  }

  /**
   * Parses User-Agent string to extract OS information
   */
  private static parseOS(userAgent: string): { os: OSType; osName: string } {
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return {
        os: "iOS",
        osName: /iPad/.test(userAgent) ? "iPad OS" : "iPhone",
      };
    }
    if (/Android/.test(userAgent)) {
      return { os: "Android", osName: "Android" };
    }
    if (/Windows/.test(userAgent)) {
      return { os: "Windows", osName: "Windows" };
    }
    if (/Macintosh/.test(userAgent)) {
      return { os: "macOS", osName: "macOS" };
    }
    if (/Linux/.test(userAgent)) {
      return { os: "Linux", osName: "Linux" };
    }
    return { os: "Unknown", osName: "Unknown" };
  }

  /**
   * Parses User-Agent string to extract browser information
   */
  private static parseBrowser(userAgent: string): {
    browser: BrowserType;
    browserName: string;
  } {
    // Order matters: Brave and Opera before all, Edge before Chrome, Safari before Chrome
    if ("brave" in navigator) {
      return { browser: "Brave", browserName: "Brave" };
    }
    if (/Opera/.test(userAgent) || /OPR\//.test(userAgent)) {
      return { browser: "Opera", browserName: "Opera" };
    }
    if (/Edg\//.test(userAgent)) {
      return { browser: "Edge", browserName: "Edge" };
    }
    if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) {
      return { browser: "Chrome", browserName: "Chrome" };
    }
    if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
      return { browser: "Safari", browserName: "Safari" };
    }
    if (/Firefox\//.test(userAgent)) {
      return { browser: "Firefox", browserName: "Firefox" };
    }

    return { browser: "Unknown", browserName: "Unknown" };
  }

  /**
   * Determines device type based on User-Agent and screen dimensions
   */
  private static determineDeviceType(
    userAgent: string,
    screenWidth: number,
    screenHeight: number
  ): DeviceType {
    // Mobile phones
    if (/iPhone|iPod|Android/.test(userAgent) && !/iPad/.test(userAgent)) {
      // Additional check for Android tablets (usually > 768px width)
      if (/Android/.test(userAgent) && screenWidth > 768) {
        return "tablet";
      }
      return "smartphone";
    }

    // Tablets
    if (/iPad/.test(userAgent)) {
      return "tablet";
    }
    if (/Android/.test(userAgent) && screenWidth > 768) {
      return "tablet";
    }

    // Desktop
    return "desktop";
  }

  /**
   * Collects immutable hardware fingerprint data
   * Only includes data that cannot be changed by user (hardware characteristics)
   * Note: Screen resolution excluded to prevent device rotation from changing the hash
   */
  private static collectFingerprintData(): string {
    if (globalThis.window === undefined) {
      throw new TypeError(
        "Device identification must be called on client-side only"
      );
    }

    const navigator_ = navigator as any;

    // Immutable hardware data (screen data excluded - rotation affects it)
    const userAgent = navigator_.userAgent || "";
    const platform = navigator_.platform || "";
    const deviceMemory = navigator_.deviceMemory || 0;
    const hardwareConcurrency = navigator_.hardwareConcurrency || 0;

    // Create fingerprint string with immutable data only
    const fingerprint = `${userAgent}|${platform}|${deviceMemory}|${hardwareConcurrency}`;

    return fingerprint;
  }
}
