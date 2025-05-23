'use client';

import { ChevronsUpDown, LogOut, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/client';
import { Link } from '@/components/Link';
import { useTranslations } from 'next-intl';

type UserData = {
    name: string;
    email: string;
    avatar: string;
};

type UserProps = {
    fallbackUser?: UserData;
};

export function NavUser({ fallbackUser }: UserProps) {
    const t = useTranslations('Navigation');
    const { isMobile } = useSidebar();
    const { useSession } = authClient;

    const { data: session, isPending } = useSession();

    const user: UserData | undefined = session?.user
        ? {
              name: session.user.name || 'User',
              email: session.user.email || '',
              avatar: session.user.image || '',
          }
        : fallbackUser;

    if (!user && isPending) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="animate-pulse focus:outline-none focus-visible:ring-0"
                    >
                        <div className="h-8 w-8 rounded-lg bg-muted" />
                        <div className="grid flex-1 gap-1">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-3 w-32 rounded bg-muted" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await authClient.signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="focus:outline-none focus-visible:ring-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {user.avatar ? (
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.name}
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback className="rounded-lg">
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user.avatar ? (
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                            className="object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback className="rounded-lg">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-xs">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild onMouseDown={handleLogout}>
                            <Link
                                href="/auth"
                                className="flex w-full items-center"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {t('Log-out')}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
