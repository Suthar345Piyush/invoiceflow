// input component 

import { cn } from "@/lib/utils";
import { forwardRef , type InputHTMLAttributes } from "react";


// input props 

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}



export const Input = forwardRef<HTMLInputElement , InputProps>(

   ({className, label, error, id, ...props}, ref) =>  {

        return (

           <div className="flex flex-col gap-1.5">

            {label && (

               <label htmlFor={id} className="text-xs font-medium text-ink-600 uppercase tracking-wider">

                {label}

               </label>
               

            )}

            <input ref={ref} id={id} className={cn("w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-ink-900 placeholder:text-ink-400 transition-colors" , "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" , error  ? "border-red-400 focus:ring-red-400" : "border-ink-200 hover:border-ink-300" , className)} {...props}/>


            {error && <p className="text-xs text-red-500">{error}</p>}

           </div>
        );   
      }

);




Input.displayName = "Input";


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}


export const Textarea = forwardRef<HTMLTextAreaElement , TextareaProps>(
       
    ({className, label, error, id, ...props}, ref) =>  {
        
        return (
            
           <div className="flex flex-col gap-1.5">

             {label && (
               
                <label htmlFor={id} className="text-xs font-medium text-ink-600 uppercase tracking-wider">

                  {label}
                   
                </label>
               
             )}


             <textarea ref={ref} id={id} className={cn("w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-ink-900 placeholder:text-ink-400 transition-colors resize-none" , "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent", error ? "border-red-400" : "border-ink-200 hover:border-ink-300" , className)}  {...props} />

             {error && <p className="text-xs text-red-500">{error}</p>}

           </div> 
           

        )  
        
    }
     
);



Textarea.displayName = "Textarea";



// select 


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options : {value : string; label : string}[];
}


export const Select = forwardRef<HTMLSelectElement , SelectProps>(
    ({className, label, error, id, options, ...props}, ref) => {
       

        return (

            <div className="flex flex-col gap-1.5">

              {label && (

                 <label htmlFor={id} className="text-xs font-medium text-ink-600 uppercase tracking-wider">

                  {label}

                 </label>


              )}


              <select ref={ref} id={id} className={cn("w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-ink-900 transition-colors" , "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" , error ? "border-red-400" : "border-ink-200 hover:border-ink-300" , className)} {...props}>


                {options.map((opt) => (
                   <option key={opt.value} value={opt.value}>
                    {opt.label}
                   </option>
                ))}

              </select>

              {error && <p className="text-xs text-red-500">{error}</p>}

            </div>

        )

    } 
)


Select.displayName = "Select";




