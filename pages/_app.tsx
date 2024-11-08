import '@/styles/globals.css'
import 'plyr/dist/plyr.css'
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast'
import Head from 'next/head';

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);

    return (
        <>
            <Head>
                {/* Cache Control Headers */}
                <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
                <meta httpEquiv="Pragma" content="no-cache" />
                <meta httpEquiv="Expires" content="0" />

                {/* Preconnect to domains */}
                <link rel="preconnect" href="https://image.tmdb.org" />
                <link rel="dns-prefetch" href="https://image.tmdb.org" />

                {/* Preload critical assets */}
                <link rel="preload" as="image" href="/download-pattern.png" />
            </Head>
            {getLayout(<Component {...pageProps} />)}
            <Toaster position="top-right" />
        </>
    );
} 