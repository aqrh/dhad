import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "pub-0280cf3b69114a558c585ee7995a25ea.r2.dev",
        pathname: "/products/**",
      },
    ],
  },
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    "192.168.0.109",
  ],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
