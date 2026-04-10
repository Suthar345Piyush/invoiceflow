// invoice summary totals panel 

'use client';

import type { LineItem } from "@/types/invoice";
import { calculateTotals, formatCurrency } from "@/lib/invoice";


interface InvoiceSummaryProps {
   lineItems : LineItem[];
   taxRate : number;
   currency : string;  
}


export function InvoiceSummary({lineItems, taxRate, currency}: InvoiceSummaryProps) {
   
   const {subtotal, taxAmount, total} = calculateTotals(lineItems, taxRate);

   const fmt = (n : number) => formatCurrency(n, currency);

   return (
      
      <div className="bg-ink-950 text-white rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm">

           <span className="text-black font-bold">Subtotal</span>
           <span className="font-medium text-black">{fmt(subtotal)}</span>
        </div>

        {taxRate > 0 && (
             
             <div className="flex justify-between text-sm">
              <span className="text-black font-medium">Tax ({taxRate}%)</span>
              <span className="font-medium text-black">{fmt(taxAmount)}</span>

              </div>
        )}

  {/* total part  */}

        <div className="flex justify-between text-sm">
          <span className="text-base font-bold text-black">Total</span>
          <span className="text-base font-medium text-black">{fmt(total)}</span>

        </div>





      </div>
     
     
   )


   
} 