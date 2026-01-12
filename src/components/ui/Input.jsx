import { cn } from '../../lib/utils';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&:-webkit-autofill]:bg-background [&:-webkit-autofill]:text-foreground [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] [&:-webkit-autofill:hover]:bg-background [&:-webkit-autofill:focus]:bg-background [&:-webkit-autofill]:border-input',
        className
      )}
      {...props}
    />
  );
}
