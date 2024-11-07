/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['res.subscene.best', 'image.tmdb.org'],
    },
    async headers() {
        return [
            {
                // সব API রাউটের জন্য CORS হেডার সেট করি
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
                ]
            }
        ];
    }
}

module.exports = nextConfig 