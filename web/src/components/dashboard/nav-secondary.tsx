import type * as React from 'react';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from '@/components/Link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: React.ElementType;
        type?: 'modal';
        modalContent?: {
            description?: string;
            email?: string;
        };
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            {item.type === 'modal' ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <SidebarMenuButton asChild size="sm">
                                            <button
                                                type="button"
                                                className="flex w-full items-center"
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </button>
                                        </SidebarMenuButton>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {item.title}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {item.modalContent?.description}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            {item.modalContent?.email && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm">
                                                        {
                                                            item.modalContent
                                                                .email
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <SidebarMenuButton asChild size="sm">
                                    <Link
                                        href={item.url}
                                        target={
                                            item.url.startsWith('http')
                                                ? '_blank'
                                                : undefined
                                        }
                                        rel={
                                            item.url.startsWith('http')
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
