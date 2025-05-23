import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Omnibox } from '@/components/dashboard/omnibox';
import { ThemeToggle } from '@/components/theme-toggle';
import { QueryProvider } from '@/lib/query/query-provider';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect('/auth');
    }

    return (
        <QueryProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex flex-col shrink-0">
                        <div className="flex h-16 items-center">
                            <div className="flex items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1" />
                            </div>

                            <div className="flex-1 flex justify-center px-4 max-w-lg mx-auto">
                                <Omnibox className="w-full" />
                            </div>

                            <div className="flex items-center gap-2 px-4">
                                <ThemeToggle />
                            </div>
                        </div>
                        <Separator />
                    </header>
                    <main className="flex-1 p-4">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </QueryProvider>
    );
}
