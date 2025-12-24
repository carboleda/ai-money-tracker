/**
 * Device operating system type
 */
export type OSType =
  | "iOS"
  | "Android"
  | "Windows"
  | "macOS"
  | "Linux"
  | "Unknown";

/**
 * Device browser type
 */
export type BrowserType =
  | "Chrome"
  | "Safari"
  | "Firefox"
  | "Edge"
  | "Brave"
  | "Opera"
  | "Unknown";

/**
 * Device classification type
 */
export type DeviceType = "smartphone" | "tablet" | "desktop";

/**
 * Complete device data object
 */
export interface DeviceData {
  /** Unique device ID generated from SHA-256 hash of immutable hardware characteristics */
  deviceId: string;

  /** Device type classification */
  deviceType: DeviceType;

  /** Human-readable device name (e.g., "Chrome on macOS") */
  deviceName: string;

  /** Raw User-Agent string */
  userAgent: string;

  /** Operating system name (e.g., "macOS", "iPhone", "Android") */
  osName: string;

  /** Operating system type */
  os: OSType;

  /** Browser name (e.g., "Chrome", "Safari") */
  browserName: string;

  /** Browser type */
  browser: BrowserType;
}
