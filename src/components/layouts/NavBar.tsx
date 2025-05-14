import { BoxIcon } from '@radix-ui/react-icons'
import { NavItem } from '@src/libs'
import Link from 'next/link'
import { FC } from 'react'
import { Logo } from '@src/components/layouts'

export interface NavBarProps {
    items?: NavItem[]
}

export const NavBar: FC<NavBarProps> = ({ items = [] }) => {
    const logoConfig = {
        width: '40px',
        height: '40px',
    }

    return (
        <>
            <div className="fixed inset-x-0 z-[100] m-auto flex h-fit w-full max-w-[1920px] flex-col items-center px-5 py-4 text-title-sm backdrop-blur-md md:text-title-md ">
                <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex h-10 w-10">
                        <Logo />
                    </div>
                    <div>
                        <div className="flex w-fit flex-row items-center gap-0 gap-x-4 md:gap-x-8">
                            {items.map((item, index) => {
                                return (
                                    <Link href={item.to} key={index} className="hover:opacity-hover">
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
