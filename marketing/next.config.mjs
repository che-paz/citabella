/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [{ source: "/nuevo", destination: "/", permanent: true }];
  },
};

export default nextConfig;
