'use client';

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { authClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const ErrorMessage = memo(({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 text-sm text-red-500 font-medium mt-4"
    >
        <AlertCircle className="h-4 w-4" />
        <p>{message}</p>
    </motion.div>
));
ErrorMessage.displayName = 'ErrorMessage';

const SignInButton = memo(
    ({
        onMouseDown,
        isLoading,
        label,
    }: {
        onMouseDown: () => void;
        isLoading: boolean;
        label: string;
    }) => (
        <Button
            variant="outline"
            type="button"
            className="w-full max-w-xs"
            onMouseDown={onMouseDown}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Mail className="mr-2 h-4 w-4" />
            )}
            {label}
        </Button>
    )
);
SignInButton.displayName = 'SignInButton';

const CardHeaderContent = memo(
    ({ title, description }: { title: string; description: string }) => (
        <div className="flex flex-col items-center space-y-2">
            <div className="p-3 flex items-center justify-center">
                <Image
                    src="/pingvolt.webp"
                    alt="Pingvolt Logo"
                    width={64}
                    height={64}
                    className="w-12 h-12 rounded-lg"
                />
            </div>
            <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
                {description}
            </CardDescription>
        </div>
    )
);
CardHeaderContent.displayName = 'CardHeaderContent';

export function SignInForm() {
    const t = useTranslations('Auth');
    const searchParams = useSearchParams();
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam && isMounted.current) {
            setHasError(true);
            setIsGoogleSubmitting(false);
        }
    }, [searchParams]);

    const signInWithGoogle = useCallback(async () => {
        if (isGoogleSubmitting) return;

        setIsGoogleSubmitting(true);
        setHasError(false);

        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/dashboard',
            });
        } catch (error) {
            if (isMounted.current) {
                console.error('Google Sign-In Error:', error);
                setHasError(true);
                setIsGoogleSubmitting(false);
            }
        }
    }, [isGoogleSubmitting]);

    return (
        <div className="h-screen flex items-center justify-center px-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="w-full">
                    <CardHeader className="space-y-4 text-center pb-6">
                        <CardHeaderContent
                            title={t('Welcome')}
                            description={t('Description')}
                        />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <SignInButton
                            onMouseDown={signInWithGoogle}
                            isLoading={isGoogleSubmitting}
                            label={t('Continue-with-google')}
                        />

                        <AnimatePresence
                            mode="wait"
                            key="auth-error"
                            presenceAffectsLayout={false}
                        >
                            {hasError && (
                                <ErrorMessage message={t('Auth-error')} />
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
