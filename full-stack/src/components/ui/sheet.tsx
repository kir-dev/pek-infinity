import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Drawer as DrawerPrimitive } from "vaul";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  theme?: "dark" | "light";
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

function Sheet({
  open,
  onOpenChange,
  title,
  description,
  theme,
  showCloseButton = true,
  children,
  className,
}: SheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <DrawerPrimitive.Content
            data-theme={theme}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-2xl border-t border-border bg-popover p-6 pb-8 text-sm text-foreground",
              className
            )}
          >
            {showCloseButton && (
              <DrawerPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerPrimitive.Close>
            )}
            {title && (
              <DrawerPrimitive.Title className="text-base font-semibold text-foreground">
                {title}
              </DrawerPrimitive.Title>
            )}
            {description && (
              <DrawerPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                {description}
              </DrawerPrimitive.Description>
            )}
            {(title || description) && (
              <div className="mb-4 mt-4 border-t border-border" />
            )}
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-open:animate-in data-closed:animate-out fade-in-0 fade-out-0 duration-200"
          )}
        />
        <DialogPrimitive.Content
          data-theme={theme}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex h-full w-[380px] max-w-full flex-col border-l border-border bg-popover text-sm text-foreground outline-none",
            "data-open:animate-in data-closed:animate-out slide-in-from-right-95 slide-out-to-right-95 duration-200 ease-out",
            className
          )}
        >
          {showCloseButton && (
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          )}
          {(title || description) && (
            <div className="border-b border-border px-6 py-5">
              {title && (
                <DialogPrimitive.Title className="ml-8 text-base font-semibold text-foreground">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="ml-8 mt-1 text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex items-center justify-end gap-3 border-t border-border px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

export { Sheet, SheetFooter };
