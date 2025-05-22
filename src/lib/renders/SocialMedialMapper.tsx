import {
    DiscordLogoIcon,
    GitHubLogoIcon,
    InstagramLogoIcon,
    LinkedInLogoIcon,
    QuestionMarkCircledIcon,
    TwitterLogoIcon,
} from '@radix-ui/react-icons'

export const RenderSocialMediaLogo = (name: string) => {
    const config = {
        width: '32px',
        height: '32px',
    }

    switch (name.toUpperCase()) {
        case 'DISCORD':
            return <DiscordLogoIcon {...config} />
        case 'X':
        case 'TWITTER':
            return <TwitterLogoIcon {...config} />
        case 'GITHUB':
            return <GitHubLogoIcon {...config} />
        case 'INSTAGRAM':
            return <InstagramLogoIcon {...config} />
        case 'LINKEDIN':
            return <LinkedInLogoIcon {...config} />
        default:
            return <QuestionMarkCircledIcon {...config} />
    }
}
