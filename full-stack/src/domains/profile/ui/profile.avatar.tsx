import { cva, type VariantProps } from 'class-variance-authority';
import { CrownIcon as ABIcon, HouseIcon as KBCardIcon } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  /** The status that determines the emphasis and badge content */
  status?:
    | false
    | { type: 'disabled'; value?: never }
    | { type: 'KDO'; value: number }
    | { type: 'KB'; value: number }
    | { type: 'AB'; value: number };
  size: VariantProps<typeof sizeVariants>['size'];
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
}

const sizeVariants = cva('relative inline-flex shrink-0', {
  variants: {
    size: {
      xs: 'size-8 text-[0.6rem]', // 32px
      sm: 'size-10 text-[0.7rem]', // 40px
      md: 'size-12 text-[0.8rem]', // 48px
      lg: 'size-14 text-[0.9rem]', // 56px
      xl: 'size-16 text-base', // 64px
      '2xl': 'size-20 text-lg', // 80px
      '3xl': 'size-24 text-xl', // 96px
      '4xl': 'size-[120px] text-2xl', // 120px
    },
  },
});

const ringVariants = cva(
  'absolute inset-0 rounded-full pointer-events-none transition-all duration-300',
  {
    variants: {
      emphasis: {
        none: 'border-2 border-transparent',
        normal: 'border-2 border-teal-600',
        highlighted: 'border-2 border-primary shadow-sm',
        boosted:
          'border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse', // Amber glow
      },
    },
    defaultVariants: {
      emphasis: 'none',
    },
  }
);

// Badge wrapper variants - controls position and base styling
const badgeVariants = cva(
  'absolute flex items-center justify-center border-2 border-background z-10',
  {
    variants: {
      emphasis: {
        none: 'hidden',
        normal: 'bg-teal-600 text-white rounded-full',
        highlighted: 'bg-primary text-primary-foreground rounded-md',
        boosted: 'bg-amber-400 text-amber-950 rounded-md',
      },
      size: {
        xs: 'hidden', // Too small for badge
        sm: '-bottom-1 -left-1 size-4 text-[0.5rem]',
        md: '-bottom-1 -left-1 size-5 text-[0.6rem]',
        lg: '-bottom-1 -left-1 size-6 text-[0.7rem]',
        xl: '-bottom-1.5 -left-1.5 min-w-7 h-7 px-1 text-xs gap-0.5',
        '2xl': '-bottom-2 -left-2 min-w-8 h-8 px-1 text-sm gap-0.5',
        '3xl': '-bottom-2 -left-2 min-w-9 h-9 px-1.5 text-base gap-1',
        '4xl': '-bottom-3 -left-3 min-w-12 h-12 px-2 text-lg gap-1',
      },
    },
    defaultVariants: {
      emphasis: 'none',
      size: 'md',
    },
  }
);

export function ProfileAvatar({
  status = false,
  size,
  src,
  alt,
  fallback,
  className,
}: ProfileAvatarProps) {
  // Derive metadata from the discriminated union status
  const { emphasis, label } = useMemo(() => {
    if (!status) {
      return { emphasis: 'none' as const, label: null };
    }

    switch (status.type) {
      case 'KDO':
        return { emphasis: 'normal' as const, label: status.value };
      case 'KB':
        return { emphasis: 'highlighted' as const, label: 'KB' };
      case 'AB':
        return { emphasis: 'boosted' as const, label: 'AB' };
      default:
        return { emphasis: 'none' as const, label: null };
    }
  }, [status]);

  return (
    <div className={cn(sizeVariants({ size }), className)}>
      <Avatar
        className={cn(
          'size-full',
          status && status.type === 'disabled' && 'grayscale opacity-60'
        )}
      >
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      {/* Ring decoration */}
      <div className={ringVariants({ emphasis })} />

      {/* Badge decoration */}
      {emphasis !== 'none' && (
        <div className={badgeVariants({ emphasis, size })}>
          {status && status.type === 'KB' && (
            <KBCardIcon className='size-[1em]' strokeWidth={2.5} />
          )}
          {status && status.type === 'AB' && (
            <ABIcon className='size-[1em]' strokeWidth={2.5} />
          )}
          <span className='font-semibold'>{label}</span>
        </div>
      )}
    </div>
  );
}

// Export variants for potential reuse or testing
export {
  sizeVariants as profileAvatarVariants,
  ringVariants,
  badgeVariants as badgeContainerVariants,
};
