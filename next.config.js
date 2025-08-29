/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'firebasestorage.googleapis.com', "res.cloudinary.com"],
  },
  async rewrites() {
    return [
      {
        source: '/lancamentos',
        destination: '/releases',
      },
      {
        source: '/imoveis', 
        destination: '/property',
      },
      {
        source: '/locacao',
        destination: '/rental',
      },
      {
        source: '/quem-somos',
        destination: '/about',
      },
    ]
  },
}

module.exports = nextConfig
