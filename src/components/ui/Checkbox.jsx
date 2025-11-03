import { cn } from '../../lib/utils';

export function Checkbox({ className, checked, onChange, ...props }) {
  return (
    <input
      type="checkbox"
      className={cn(
        'w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-0 cursor-pointer',
        className
      )}
      checked={checked}
      onChange={onChange}
      {...props}
    />
  );
}
