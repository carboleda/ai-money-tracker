import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    outputFileTracingRoot: path.join(process.cwd(), "prompts"),
  },
};

export default nextConfig;
