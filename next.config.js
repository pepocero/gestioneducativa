/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forzar uso de Babel en lugar de SWC
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  // Deshabilitar todas las optimizaciones que usan SWC
  experimental: {
    forceSwcTransforms: false,
  },
  images: {
    domains: ['liqxrhrwiasewfvasems.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Sistema de Gestión Educativa',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
