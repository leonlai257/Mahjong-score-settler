export interface NavItem {
    name: string
    to: string
}

export const navItems: NavItem[] = [
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
]
