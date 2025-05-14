import Image from 'next/image'
import Link from 'next/link'

export const Logo = () => {
    return (
        <Link href="/" className="btn flex w-full items-center justify-start gap-2">
            <Image
                src="/Logo.png"
                width={200}
                height={200}
                alt="NavLogo"
                style={{
                    width: '100%',
                    height: 'auto',
                }}
            />

            <div className="text-title">Brand</div>
        </Link>
    )
}
