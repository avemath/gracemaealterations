/** @type {import('next').NextConfig} */
const nextConfig = {
  // Every image is served straight from Sanity's CDN (which sizes and
  // converts it), so Next's own image optimizer is never used or exposed.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/sanity.loader.ts",
  },
  trailingSlash: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // A light policy that can't break the site or the Studio: no plugins,
          // no <base> hijacking, no framing by other sites, forms post here only.
          {
            key: "Content-Security-Policy",
            value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
