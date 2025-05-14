import { PageLayout } from '@src/components/layouts'

export default function Catch() {
    return (
        <>
            <PageLayout>
                <div className="relative inset-0 m-auto flex h-screen flex-col justify-center">
                    <div className="translate-y-[-50%] px-4">
                        <div className="text-welcome text-center">Sorry, we could not find that page.</div>
                    </div>
                </div>
            </PageLayout>
        </>
    )
}
