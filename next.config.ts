import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    output: "standalone",
    /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "placehold.co",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
                port: "",
                pathname: "/**",
            },
        ],
    },
    devIndicators: {
        buildActivity: false,
        appIsrStatus: false,
    },
    experimental: {
        // This is required for the dev server to work in this environment
        allowedDevOrigins: ["https://*.cloudworkstations.dev"],
    },
};

export default nextConfig;
