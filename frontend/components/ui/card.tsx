import React from "react";
import { cn } from "../../utils/cn";  // Relative path

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-white rounded-lg shadow-md p-4", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-b pb-2 mb-3">
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent };
