'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export const Link: typeof NextLink = (({ children, ...props }) => {
    const router = useRouter();
    return (
        <NextLink
            prefetch={true}
            onMouseDown={(e) => {
                const url = new URL(
                    String(props.href as string),
                    window.location.href
                );
                if (
                    url.origin === window.location.origin &&
                    e.button === 0 &&
                    !e.altKey &&
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !e.shiftKey
                ) {
                    e.preventDefault();
                    router.push(String(props.href as string));
                }
            }}
            {...props}
        >
            {children}
        </NextLink>
    );
}) as typeof NextLink;
