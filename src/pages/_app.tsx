'use client'

import { persistor, store } from '@src/redux/store'
import '@src/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <div className="relative flex min-h-screen w-full flex-col bg-background font-sans text-text">
                    <Component {...pageProps} />
                </div>
            </PersistGate>
        </Provider>
    )
}

export default App
