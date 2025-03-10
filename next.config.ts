import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns: [
      {
        hostname: "u9a6wmr3as.ufs.sh"
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ]
  }
};

export default nextConfig;
