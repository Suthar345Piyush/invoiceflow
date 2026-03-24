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
              
              "bg-ink-900 text-ink-50 hover:bg-ink-800 active:bg-ink-950 shadow-sm" : variant === "primary",

              "bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 border border-ink-200" : variant === "secondary",

              "text-ink-700 hover:bg-ink-100 active:bg-ink-200" : variant === "ghost",

              "bg-red-600 text-white hover:bg-red-700 active:bg-red-800" : variant === "danger",

             },

             {
               "px-3 py-1.5 text-xs": size === "sm",
               "px-4 py-2.5 text-sm": size === "md",
               "px-6 py-3 text-base": size === "lg",
             },

             className

          )} {...props}>


            {
                loading && (
                   <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">

                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>

                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>

                   </svg>
                )
            }

            {children}

          </button>

       )
        
    }
);


Button.displayName = "Button";

