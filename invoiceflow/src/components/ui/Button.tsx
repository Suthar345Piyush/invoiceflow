// reusable button component 

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes , forwardRef } from "react";


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}



// returning button component

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
       {
         className,
         variant = "primary",
         size = "md",
         loading = false,
         children,
         disabled,
         ...props
       },
       ref
    ) => {
        
       return (

          <button ref={ref} disabled={disabled || loading} className={cn(
           
             "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none",


             {
              
              "bg-ink-900 text-ink-50 hover:bg-ink-800 active:bg-ink-300 border border-ink-200" : variant === "primary",


             }

          )}>

          </button>

       )
        
    }
)

