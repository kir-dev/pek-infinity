import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Title Component: xl, bold, never muted
const titleVariants = cva('text-xl font-bold text-foreground');

export interface TitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  asChild?: boolean;
}

export const Title = ({ className, asChild = false, ...props }: TitleProps) => {
  const Comp = asChild ? Slot.Root : 'h1';
  return <Comp className={cn(titleVariants({ className }))} {...props} />;
};

// Subtitle Component: lg, medium, never muted
const subtitleVariants = cva('text-lg font-medium text-foreground');
export interface SubtitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof subtitleVariants> {
  asChild?: boolean;
}

export const Subtitle = ({
  className,
  asChild = false,
  ...props
}: SubtitleProps) => {
  const Comp = asChild ? Slot.Root : 'h2';
  return <Comp className={cn(subtitleVariants({ className }))} {...props} />;
};

// Text Component: 14px (base), can be muted or emphasized
const textVariants = cva('text-sm leading-normal', {
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

// Paragraph Component: 14px (base)
const paragraphVariants = cva('text-sm leading-normal text-foreground');
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
const detailVariants = cva('text-xs text-muted-foreground', {
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
