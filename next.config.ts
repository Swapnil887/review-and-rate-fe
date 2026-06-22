import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "da7ssyutu";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${cloudName}/**`,
      },
    ],
  },
};

export default nextConfig;
