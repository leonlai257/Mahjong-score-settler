import { FooterItem, RenderSocialMediaLogo } from '@src/libs'
import Link from 'next/link'
import { FC } from 'react'
import { Logo } from '@src/components/layouts'

export interface FooterProps {
    items?: FooterItem
}

export const Footer: FC<FooterProps> = ({
    items = {
        terms: [],
        social: [],
        sections: [],
    },
}) => {
    const { terms, social, sections } = items

    return (
        <>
            <div className="mt-6 flex w-full flex-col items-center justify-center px-5 md:mt-12">
                <div className="flex w-full flex-col justify-start gap-y-5">
                    <div className="flex flex-col justify-between md:flex-row">
                        <div className="flex w-fit flex-col items-start gap-y-5">
                            <div className="flex h-10 w-10">
                                <Logo />
                            </div>
                            <div className="text-body">Here is a brand message</div>
                            <div className="flex items-center gap-1">
                                {social &&
                                    social.map((item, index) => {
                                        return (
                                            <>
                                                <a
                                                    key={index}
                                                    href={item.to}
                                                    target="_blank"
                                                    className="flex h-10 w-10 items-center justify-center hover:opacity-hover">
                                                    {RenderSocialMediaLogo(item.name)}
                                                </a>
                                            </>
                                        )
                                    })}
                            </div>
                            <div className="text-light-primary flex py-[5px] text-body-sm">
                                <div className="flex flex-row items-center ">
                                    {terms &&
                                        terms.map((item, index) => {
                                            return (
                                                <>
                                                    <Link
                                                        key={index}
                                                        href={item.to}
                                                        className="flex w-fit flex-row items-center hover:opacity-hover">
                                                        {item.name}
                                                    </Link>
                                                    {index !== terms.length - 1 && <div className="mx-[6px] h-[12px] w-[1px] bg-white" />}
                                                </>
                                            )
                                        })}
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full basis-4/5 self-stretch py-3 md:self-auto md:py-0">
                            <div className="flex w-full justify-end gap-x-4 md:flex-grow-0">
                                {sections &&
                                    sections.map((section, index) => {
                                        return (
                                            <div key={`section-${index}`} className={'flex basis-1/5 flex-col justify-start gap-y-4'}>
                                                <div className="text-title">{section.name}</div>

                                                <div className="flex flex-col justify-start gap-y-2">
                                                    {section.items.map((item, index) => {
                                                        return (
                                                            <Link
                                                                key={index}
                                                                href={item.to}
                                                                className="md:text-body-mg flex w-fit flex-row items-center text-body-sm hover:opacity-hover lg:text-body-lg">
                                                                <div className="text-body">{item.name}</div>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-text" />

                    <div className="mb-5 flex w-full justify-center">
                        <div className="text-body">Copyright © 2024 Company Ltd. All rights reserved.</div>
                    </div>
                </div>
            </div>
        </>
    )
}
