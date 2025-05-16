import Image from 'next/image'
import Link from 'next/link'

export const Logo = () => {
    return (
        <Link href="/" className="btn flex w-full items-center justify-start gap-2 whitespace-nowrap">
            <div className="text-title">Mahjong Score Settler (OCR)</div>
        </Link>
    )
}
