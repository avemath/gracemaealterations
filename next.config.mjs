/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add domains here if using external images
    // domains: [],
    formats: ["image/avif", "image/webp"],
  },
  // Redirect trailing slashes for cleaner canonical URLs
  trailingSlash: false,
};

export default nextConfig;
