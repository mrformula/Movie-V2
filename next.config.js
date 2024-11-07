/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        domains: ['res.subscene.best', 'image.tmdb.org'],
    }
}

module.exports = nextConfig 