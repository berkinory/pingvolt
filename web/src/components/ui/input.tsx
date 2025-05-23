import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.ComponentProps<'input'> {
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, id, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPasswordInput = type === 'password';
        const effectiveType = showPassword ? 'text' : type;

        return (
            <div className="space-y-1">
                {label && <Label htmlFor={id}>{label}</Label>}
                <div className="relative">
                    <input
                        type={effectiveType}
                        className={cn(
                            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                            isPasswordInput && 'pr-10',
                            className
                        )}
                        id={id}
                        ref={ref}
                        {...props}
                    />
                    {isPasswordInput && (
                        <button
                            type="button"
                            onMouseDown={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
