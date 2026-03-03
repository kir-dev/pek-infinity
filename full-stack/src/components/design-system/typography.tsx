import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Title Component: xl, bold, never muted
const titleVariants = cva('font-bold text-foreground text-xl tracking-tight');

export interface TitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  asChild?: boolean;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Title = ({
  className,
  asChild = false,
  level = 1,
  ...props
}: TitleProps) => {
  const Comp = asChild ? Slot.Root : `h${level}`;
  return <Comp className={cn(titleVariants({ className }))} {...props} />;
};

// Subtitle Component: lg, medium, never muted
const subtitleVariants = cva('font-medium text-foreground text-lg');
export interface SubtitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof subtitleVariants> {
  asChild?: boolean;
  level?: 2 | 3 | 4 | 5 | 6;
}

export const Subtitle = ({
  className,
  asChild = false,
  level = 2,
  ...props
}: SubtitleProps) => {
  const Comp = asChild ? Slot.Root : `h${level}`;
  return <Comp className={cn(subtitleVariants({ className }))} {...props} />;
};

// Text Component: 14px (base), can be muted or emphasized
// used for UI elements, compact text
const textVariants = cva('text-sm', {
  variants: {
    muted: {
      true: 'text-muted-foreground',
      false: 'text-foreground',
    },
    emphasized: {
      true: 'font-medium',
      false: 'font-normal',
    },
  },
  defaultVariants: {
    muted: false,
    emphasized: false,
  },
});

export interface TextProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
}

export const Text = ({
  className,
  muted,
  emphasized,
  asChild = false,
  ...props
}: TextProps) => {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      className={cn(textVariants({ muted, emphasized, className }))}
      {...props}
    />
  );
};

// Paragraph Component: 14px (base), extra line height
// used for user-authored prose
const paragraphVariants = cva('text-foreground text-sm leading-normal');
export interface ParagraphProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {
  asChild?: boolean;
}

export const Paragraph = ({
  className,
  asChild = false,
  ...props
}: ParagraphProps) => {
  const Comp = asChild ? Slot.Root : 'p';
  return <Comp className={cn(paragraphVariants({ className }))} {...props} />;
};

// Detail Component: 12px, regular, always muted
// used for metadata, secondary info
const detailVariants = cva('text-muted-foreground text-xs tracking-wide', {
  variants: {
    emphasized: {
      true: 'font-medium',
      false: 'font-normal',
    },
  },
  defaultVariants: {
    emphasized: false,
  },
});

export interface DetailProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof detailVariants> {
  asChild?: boolean;
}

export const Detail = ({
  className,
  emphasized,
  asChild = false,
  ...props
}: DetailProps) => {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      className={cn(detailVariants({ emphasized, className }))}
      {...props}
    />
  );
};
