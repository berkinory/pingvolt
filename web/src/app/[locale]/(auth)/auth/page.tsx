import { redirect } from 'next/navigation';
import { SignInForm } from './sign-in-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export default async function SignInPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect('/dashboard');
    }

    return (
        <div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
            </div>
            <SignInForm />
        </div>
    );
}
