import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orça Fácil',
    short_name: 'Orça Fácil',
    description: 'Sistema profissional de geração e gerenciamento de orçamentos rápidos e recibos.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
