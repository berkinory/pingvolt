'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link } from '@/components/Link';
import { useTranslations } from 'next-intl';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const t = useTranslations('Navigation');
    const { isMobile, setOpenMobile } = useSidebar();
    const currentPathname = usePathname();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t('Platform')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isMainItemActive = currentPathname === item.url;
                    const isAnySubItemActive =
                        item.items?.some(
                            (subItem) => currentPathname === subItem.url
                        ) ?? false;
                    const isSectionActive =
                        isMainItemActive || isAnySubItemActive;

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isSectionActive}
                        >
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isMainItemActive}
                                >
                                    <Link
                                        href={item.url}
                                        onMouseDown={handleLinkClick}
                                        className={cn(
                                            isMainItemActive &&
                                                'pointer-events-none'
                                        )}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <ChevronRight />
                                                <span className="sr-only">
                                                    Toggle
                                                </span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => {
                                                    const isSubItemActive =
                                                        currentPathname ===
                                                        subItem.url;
                                                    return (
                                                        <SidebarMenuSubItem
                                                            key={subItem.title}
                                                        >
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={
                                                                    isSubItemActive
                                                                }
                                                            >
                                                                <Link
                                                                    href={
                                                                        subItem.url
                                                                    }
                                                                    onMouseDown={
                                                                        handleLinkClick
                                                                    }
                                                                    className={cn(
                                                                        isSubItemActive &&
                                                                            'pointer-events-none'
                                                                    )}
                                                                >
                                                                    <span>
                                                                        {
                                                                            subItem.title
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
