import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>বাংলা সাবটাইটেল খোঁজার সাইট</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="বাংলা সাবটাইটেল খোঁজার সাইট" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
        </>
    )
} 