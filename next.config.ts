import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        destination: "/properties/:slug",
        permanent: false,
        source: "/:locale(en)/p/:slug",
      },
      {
        destination: "/hotels/:slug",
        permanent: false,
        source: "/:locale(en)/h/:slug",
      },
      {
        destination: "/booking",
        permanent: false,
        source: "/:locale(en)/book",
      },
      {
        destination: "/booking/payment",
        permanent: false,
        source: "/:locale(en)/pay",
      },
      {
        destination: "/booking/confirmed",
        permanent: false,
        source: "/:locale(en)/confirmed",
      },
      {
        destination: "/bookings",
        permanent: false,
        source: "/:locale(en)/bookings",
      },
      {
        destination: "/bookings/:id",
        permanent: false,
        source: "/:locale(en)/bookings/:id",
      },
      {
        destination: "/saved",
        permanent: false,
        source: "/:locale(en)/saved",
      },
      {
        destination: "/hotels",
        permanent: false,
        source: "/:locale(en)/hotels",
      },
      {
        destination: "/rent",
        permanent: false,
        source: "/:locale(en)/rent",
      },
      {
        destination: "/buy",
        permanent: false,
        source: "/:locale(en)/buy",
      },
      {
        destination: "/new-projects",
        permanent: false,
        source: "/:locale(en)/new-projects",
      },
      {
        destination: "/messages",
        permanent: false,
        source: "/:locale(en)/messages",
      },
      { destination: "/", permanent: false, source: "/:locale(en)" },
    ];
  },
};

export default nextConfig;
