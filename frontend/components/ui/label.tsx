import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn"; 

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "label";
    return (
      <Comp
        ref={ref}
        className={cn("text-sm font-medium text-gray-700", className)}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label };
