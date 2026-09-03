import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "accessmyland.com" }],
        destination: "https://www.accessmyland.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
