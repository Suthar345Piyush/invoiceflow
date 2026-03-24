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

           <span className="text-ink-400">Subtotal</span>
           <span className="font-medium">{fmt(subtotal)}</span>
        </div>

        {taxRate > 0 && (
             
             <div className="flex justify-between text-sm">
              <span className="text-ink-400">Tax ({taxRate}%)</span>
              <span className="font-medium">{fmt(taxAmount)}</span>

              </div>
        )}

  {/* total part  */}

        <div className="border-t border-ink-700 pt-3 justify-between flex">
          <span className="text-base font-semibold">Total</span>
          <span className="text-base font-bold text-brand-400">{fmt(total)}</span>

        </div>





      </div>
     
     
   )


   
} 