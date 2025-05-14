import { NavItem } from '@src/libs'

interface Section {
    name: string
    items: NavItem[]
}

export interface FooterItem {
    sections?: Section[]
    social?: NavItem[]
    terms?: NavItem[]
}

export const footerItems: FooterItem = {
    sections: [
        {
            name: 'Services',
            items: [
                {
                    name: 'Web Development',
                    to: '/web-development',
                },
                {
                    name: 'Mobile Development',
                    to: '/mobile-development',
                },
                {
                    name: 'Cloud Services',
                    to: '/cloud-services',
                },
                {
                    name: 'DevOps',
                    to: '/devops',
                },
            ],
        },
        {
            name: 'Company',
            items: [
                {
                    name: 'About',
                    to: '/about',
                },
                {
                    name: 'Contact',
                    to: '/contact',
                },
                {
                    name: 'Careers',
                    to: '/careers',
                },
            ],
        },
    ],
    social: [
        {
            name: 'Instagram',
            to: 'https://www.instagram.com/',
        },
        {
            name: 'Twitter',
            to: 'https://twitter.com',
        },
        {
            name: 'LinkedIn',
            to: 'https://www.linkedin.com/',
        },
        {
            name: 'Github',
            to: 'https://github.com/',
        },
    ],
    terms: [
        {
            name: 'Services',
            to: '/services',
        },
        {
            name: 'Company',
            to: '/company',
        },
        {
            name: 'About',
            to: '/about',
        },
    ],
}
