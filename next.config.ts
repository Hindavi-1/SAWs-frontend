import type { NextConfig } from "next";

// Backend origin for the server-side /api proxy. Configurable so a deployed
// environment can point at its own backend without editing this file.
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`, // Proxy to FastAPI backend
      },
    ];
  },
};

export default nextConfig;
