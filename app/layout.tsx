import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Geist } from 'next/font/google'
import { AuthProviderWrapper } from '@/components/auth0-provider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://eliteagua.vercel.app'),
  title: {
    default: 'Elite Agua | Agua mineral envasada en el manantial',
    template: '%s | Elite Agua',
  },
  description:
    'Elite Agua: agua mineral pura envasada en el manantial, en Anaco, Anzoátegui, Venezuela. Cajas de 350 ml, 600 ml y 1.5 L. Compra en línea y recibe tu pedido en casa.',
  keywords: ['agua mineral', 'agua Elite', 'embotelladora', 'agua envasada', 'Anaco', 'Anzoátegui', 'Venezuela', 'agua purificada'],
  authors: [{ name: 'Elite Agua' }],
  creator: 'Elite Agua',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: { icon: '/elite-logo.jpg', apple: '/elite-logo.jpg' },
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    url: '/',
    siteName: 'Elite Agua',
    title: 'Elite Agua | Agua mineral envasada en el manantial',
    description: 'Agua mineral pura envasada en el manantial. Elige tu formato favorito y lo llevamos a tu mesa.',
    images: [{ url: '/elite-logo.jpg', width: 512, height: 512, alt: 'Logo de Elite Agua' }],
  },
  twitter: {
    card: 'summary',
    title: 'Elite Agua | Agua mineral envasada en el manantial',
    description: 'Agua mineral pura envasada en el manantial. Elige tu formato favorito y lo llevamos a tu mesa.',
    images: ['/elite-logo.jpg'],
  },
}

export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#173b4d' }

const themeScript = `(function(){try{var t=localStorage.getItem('elite-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Elite Agua',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://eliteagua.vercel.app',
  logo: '/elite-logo.jpg',
  description: 'Embotelladora de agua mineral envasada en el manantial, ubicada en Anaco, Anzoátegui, Venezuela.',
  email: 'embotelladora.elite@gmail.com',
  telephone: '+58-412-9412247',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Urb. Campo Dowell',
    addressLocality: 'Anaco',
    addressRegion: 'Anzoátegui',
    postalCode: '6003',
    addressCountry: 'VE',
  },
  sameAs: ['https://wa.me/584129412247'],
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Elite Agua',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://eliteagua.vercel.app',
  inLanguage: 'es-VE',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable} ${dmSerif.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      </head>
      <body className="antialiased"><AuthProviderWrapper>{children}</AuthProviderWrapper>{process.env.NODE_ENV === 'production' && <Analytics />}</body>
    </html>
  )
}