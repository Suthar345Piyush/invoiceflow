// invoice amounts related calculations code -------------


import type { LineItem , InvoiceTotals } from "@/types/invoice";

export function calculateTotals(lineItems : LineItem[] , taxRate : number) : InvoiceTotals {

      const subtotal = lineItems.reduce((sum , item) => sum + item.quantity * item.rate, 0);

      const taxAmount = subtotal * (taxRate / 100);

      const total = subtotal + taxAmount;

      return {subtotal , taxAmount , total};

}


// formatting the currency , INR first 

export function formatCurrency(amount : number , currency : string = "INR"): string {
     
   return new Intl.NumberFormat("en-IN" , {
     style: "currency",
     currency,
     minimumFractionDigits : 2,
   }).format(amount);
}








