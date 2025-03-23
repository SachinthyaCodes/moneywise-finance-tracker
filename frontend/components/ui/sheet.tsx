import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../utils/cn"; 

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 bg-black/50" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 right-0 w-[300px] sm:w-[400px] bg-white shadow-lg p-6 transition-transform transform-gpu",
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

const SheetHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-between border-b pb-3 mb-4">
    {children}
  </div>
);

const SheetTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
