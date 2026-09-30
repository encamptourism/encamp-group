/** @type {import('next').NextConfig} */
const nextConfig = {
  // lets the dev server hydrate when opened through a cloudflared quick tunnel
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "encamp-s3b.s3.ap-south-1.amazonaws.com" }],
  },
};

export default nextConfig;
