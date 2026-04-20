import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] active:transition-transform active:duration-100",
  {
    variants: {
      variant: {
        default: "bg-green-400 text-white hover:bg-green-500",
        soft: "bg-green-900 text-green-300 hover:bg-green-900/80",
        destructive: "bg-red-400 text-white hover:bg-red-500",
        ghost: "bg-card text-foreground border border-border hover:bg-card-hover",
        outline: "border border-border-light bg-background text-foreground hover:bg-card",
        link: "text-green-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "rounded-pill px-6 py-3",
        sm: "rounded-pill px-[22px] py-2.5",
        compact: "rounded-pill px-4 py-[7px]",
        lg: "rounded-pill px-8 py-3.5 text-base",
        icon: "h-10 w-10 rounded-pill",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
