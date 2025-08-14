/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // STATICKÝ EXPORT PRO WEBHOSTING
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Vypnout server-side funkce pro statický export
  experimental: {
    appDir: true,
  },
  // Nastavit base path pokud je potřeba
  // basePath: '/project13',
}

export default nextConfig
