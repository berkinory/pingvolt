'use client';

import type * as React from 'react';
import {
    LifeBuoy,
    SquareActivity,
    House,
    ChartNoAxesCombined,
    CreditCard,
    Ticket,
} from 'lucide-react';
import { FiGithub } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Link } from '@/components/Link';
import { NavMain } from '@/components/dashboard/nav-main';
import { NavSecondary } from '@/components/dashboard/nav-secondary';
import { NavUser } from '@/components/dashboard/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export type NavItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    keywords?: string[];
};

export const createSidebarData = (t: ReturnType<typeof useTranslations>) => ({
    fallbackUser: {
        name: 'User',
        email: 'user@user.com',
        avatar: '',
    },
    navMain: [
        {
            title: t('Home'),
            url: '/dashboard/home',
            icon: House,
            keywords: ['dashboard', 'main', 'home', 'start'],
        },
        {
            title: t('Monitors'),
            url: '/dashboard/monitors',
            icon: SquareActivity,
            keywords: ['monitor', 'heartbeat', 'uptime', 'websites'],
        },
        {
            title: t('Status'),
            url: '/dashboard/status-page',
            icon: ChartNoAxesCombined,
            keywords: [
                'status',
                'pages',
                'uptime',
                'downtime',
                'analytics',
                'websites',
            ],
        },
        {
            title: t('Referrals'),
            url: '/dashboard/refferals',
            icon: Ticket,
            keywords: ['referrals', 'invite', 'affiliates', 'friends'],
        },
        {
            title: t('Billing'),
            url: '/dashboard/billing',
            icon: CreditCard,
            keywords: ['billing', 'payment', 'subscription', 'plan'],
        },
    ],
    navSecondary: [
        {
            title: t('Support'),
            url: '#',
            icon: LifeBuoy,
            keywords: [
                'help',
                'support',
                'assistance',
                'contact',
                'feedback',
                'suggestion',
                'report',
            ],
            type: 'modal' as const,
            modalContent: {
                description: t('Need-help'),
                email: 'support@pingvolt.com',
            },
        },
        {
            title: 'Github',
            url: 'https://github.com/berkinory/pingvolt',
            icon: FiGithub,
            keywords: [
                'github',
                'contribute',
                'code',
                'issues',
                'pull-requests',
                'report',
            ],
        },
        {
            title: 'Follow on X',
            url: 'https://x.com/berkinory',
            icon: FaXTwitter,
            keywords: ['twitter', 'x', 'social', 'share', 'tweet'],
        },
    ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const t = useTranslations('Navigation');
    const data = createSidebarData(t);

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="py-1">
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex">
                                    <Image
                                        src="/pingvolt.webp"
                                        alt="Pingvolt Logo"
                                        width={32}
                                        height={32}
                                        className="size-8 object-contain rounded-md"
                                    />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate text-base font-semibold">
                                        Pingvolt
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser fallbackUser={data.fallbackUser} />
            </SidebarFooter>
        </Sidebar>
    );
}
