import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        domains: [
            'localhost',
            'api.example.com',
            'proex.ufpa.br',
            'example.com',
        ],
    },
};

export default nextConfig;
