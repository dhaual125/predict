import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",    // Static HTML → Netlify serves `out/` as plain files
  trailingSlash: true, // /page → /page/index.html, prevents 404s on Netlify
  // cacheComponents & partialPrefetching (PPR) are server-only — incompatible with output:'export'
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
