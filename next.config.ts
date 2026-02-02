import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable WebSocket in production to avoid connection issues
  ...(process.env.NODE_ENV === 'production' && {
    // Ensure we're in production mode
    poweredByHeader: false,
  }),
  // Optimize build output for Docker
  compress: true,
  // Use standalone output for smaller Docker images - reduces image size significantly
  output: 'standalone',
};

export default nextConfig;
