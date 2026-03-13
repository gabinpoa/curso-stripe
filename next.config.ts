import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "institutosaber.org",
        port: "",
        pathname: "produtos/*/thumbnail.*",
        search: "",
      },
      {
        protocol: "https",
        hostname: "cdn.institutosaber.org",
        port: "",
      },
    ],
  },
};

export default nextConfig;
