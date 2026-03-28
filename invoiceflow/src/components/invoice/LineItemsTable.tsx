// invoice - lintItemsTable code part (lineitems - id, description, quantity, rate)

'use client';

import { Trash2 , Plus } from "lucide-react";
import type { LineItem } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice";
import { cn } from "@/lib/utils";


interface LineItemsTableProps {
   items : LineItem[];
   currency : string;
   onChange : (items : LineItem[]) => void;  
}



export function LineItemsTable({items, currency, onChange} : LineItemsTableProps) {
    
    const addItem = () => {
       onChange([
          ...items,
          
          {id : crypto.randomUUID(), description : "", quantity : 1, rate : 0}

       ]);
    };


    // remove item function 

    const removeItem = (id : string) => {
       if(items.length === 1) return;

       onChange(items.filter((i) => i.id !== id));
    }

    // updating the item function 



    const updateItem = (id : string, field : keyof LineItem, value : string | number ) => {

       onChange(
          items.map((i) => i.id === id ? {
             
            ...i,

            [field]: field === "quantity" || field === "rate" ? parseFloat(value as string) || 0 : value,

          } : i)
       );
    };



    return (
        
        <div className="space-y-2">

           <div className="grid grid-cols-[1fr_80px_110px_100px_36px] gap2 px-2">

          {["Description", "Qty", "Rate", "Amount", ""].map((h) => (

             <span key={h} className="text-[10px] uppercase font-medium tracking-wider text-ink-50">
              {h}               
             </span>

          ))}
             
           </div>


           {/* items  */}

           <div className="space-y-2">

             {items.map((item, index) => (

               <div key={item.id} className={cn("grid grid-cols-[1fr_80px_110px_100px_36px] gap-2 items-center p-2 rounded-xl bg-ink-50 border border-ink-100 hover:border-ink-200 transition-colors")}>

                <input type="text" placeholder={`Item ${index + 1}`} value={item.description} onChange={(e) => updateItem(item.id , "description" , e.target.value)} 
                className="w-full px-2.5 py-2 text-sm bg-white rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-ink-300"
                />

                <input type="number" min="0" step="0.01" value={item.quantity || ""} onChange={(e) => updateItem(item.id , "quantity" , e.target.value)} 
                className="w-full px-2.5 py-2 text-sm bg-white rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-center"
                />

               <input type="number" min="0" step="0.01" value={item.rate || ""} onChange={(e) => updateItem(item.id , "rate" , e.target.value)} 
                className="w-full px-2.5 py-2 text-sm bg-white rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-right"
                />


                <div className="px-2 py-2 text-sm font-medium text-ink-700 text-right">

                  {formatCurrency(item.quantity * item.rate, currency)}

                  </div>


                  <button onClick={() => removeItem(item.id)} disabled={items.length === 0} className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">

                    <Trash2 size={14}/>

                  </button>

                </div>
             ))}
           </div>

        {/* for adding item  button*/}

   <button onClick={addItem} type="button" className="flex items-center gap-2 px-3 py-2  text-sm text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-lg transition-all border border-dashed border-ink-200 hover:border-ink-400 w-full justify-center mt-1">

    <Plus size={14}/>
    Add line item

   </button>
             
      </div>
        
      
    )

}
