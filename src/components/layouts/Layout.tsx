import { FC, ReactNode } from 'react'
import Head from 'next/head'
import { Footer, NavBar } from '@src/components/layouts'
import { footerItems, navItems } from '@libs/constants'

export interface PageLayoutProps {
    children: ReactNode
}

export const PageLayout: FC<PageLayoutProps> = ({ children }) => {
    const SITE_TITLE = 'Next.js Boilerplate'

    return (
        <>
            <Head>
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
                <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
                <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
                <link href="/favicon-16x16.png" rel="apple-touch-icon" type="image/png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />

                <link href="/favicon.ico" rel="icon" />
                <title>{SITE_TITLE}</title>
                <meta content={SITE_TITLE} />
                <meta content="This is a NextJS boilerplate." name="description" />
                <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
            </Head>
            <main>
                <NavBar items={navItems} />
                <div className="relative inset-x-0 m-auto flex min-h-screen w-full max-w-[1920px] flex-col items-center justify-center overflow-hidden pt-24">
                    {/* pt-24 is the height of NavBar */}
                    {children}
                    <Footer items={footerItems} />
                </div>
            </main>
        </>
    )
}
