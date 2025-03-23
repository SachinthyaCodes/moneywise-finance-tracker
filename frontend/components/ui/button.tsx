import * as React from "react";
import { cn } from "../../utils/cn";  // Relative path




export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

const Button: React.FC<ButtonProps> = ({ variant = "primary", className, ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded text-white font-medium transition-all",
        variant === "primary" && "bg-blue-600 hover:bg-blue-700",
        variant === "secondary" && "bg-gray-600 hover:bg-gray-700",
        variant === "outline" && "border border-gray-300 text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
};

export { Button };  // ✅ Ensure correct export
