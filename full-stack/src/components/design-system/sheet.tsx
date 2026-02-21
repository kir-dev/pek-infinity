import {
  SheetContent as ShadSheetContent,
  SheetDescription as ShadSheetDescription,
  SheetHeader as ShadSheetHeader,
  Sheet,
  SheetClose,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const SheetContent: typeof ShadSheetContent = ({
  className,
  ...params
}) => {
  return (
    <ShadSheetContent
      data-theme='dark'
      className={cn(
        'glass-elevated rounded-t-xl border border-glass bg-white/15 text-white backdrop-blur-2xl',
        className
      )}
      {...params}
    />
  );
};

export const SheetHeader: typeof ShadSheetHeader = ({
  className,
  ...params
}) => {
  return (
    <ShadSheetHeader className={cn('text-white', className)} {...params} />
  );
};

export const SheetDescription: typeof ShadSheetDescription = ({
  className,
  ...params
}) => {
  return (
    <ShadSheetDescription
      className={cn('text-white/70', className)}
      {...params}
    />
  );
};

export { Sheet, SheetClose, SheetFooter, SheetTitle, SheetTrigger };
