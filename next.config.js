/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        domains: ['image.tmdb.org', 'themoviedb.org'],
    },
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
}

module.exports = nextConfig 