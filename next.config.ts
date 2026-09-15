import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/admissao",
      destination: "/login?callbackUrl=%2Fadmissao%2Fquestionario",
      permanent: true,
    }];
  },
  async headers() {
    return [{
      source: "/contrato/:path*",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    }, {
      source: "/convite/:path*",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }];
  },
};

export default nextConfig;
