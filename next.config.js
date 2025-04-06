/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  images: {
    domains: ['ext.same-assets.com', 'tailwindui.com', 'images.unsplash.com', 'reussirafrique.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Ajouter le support des fichiers audio
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media',
          outputPath: 'static/media',
          name: '[name].[ext]',
        },
      },
    });

    // Configuration côté client uniquement
    if (!isServer) {
      // Désactiver les modules Node.js côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false
      };

      // Ignorer les modules natifs côté client
      config.externals = [
        ...(config.externals || []),
        {
          '@mapbox/node-pre-gyp': '@mapbox/node-pre-gyp',
          'jsonwebtoken': 'jsonwebtoken'
        }
      ];
    }

    // Ajouter un alias pour bcryptjs
    config.resolve.alias = {
      ...config.resolve.alias,
      bcrypt: 'bcryptjs'
    };

    return config;
  },
  // Ajouter la configuration pour l'environnement de production
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET
  }
};

module.exports = nextConfig;
