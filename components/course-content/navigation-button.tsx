import * as React from "react";
import { cn } from "@/lib/utils";

interface NavigationButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const NavigationButton = React.forwardRef<
  HTMLButtonElement,
  NavigationButtonProps
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex md:max-w-[433px] items-center justify-center border bg-background text-xs md:text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 shadow",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
NavigationButton.displayName = "NavigationButton";
