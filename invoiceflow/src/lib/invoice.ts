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


// invoice number generation function 

export function generateInvoiceNumber() : string {
   
     const now = new Date();
     const year = now.getFullYear();
     const month = String(now.getMonth() + 1).padStart(2 , "0");
     const random = Math.floor(Math.random() * 9000) + 1000;
     
     return `INV-${year}${month}-${random}`;
}


// creating a default invoice 

export function getDefaultInvoice() {
     
      const today = new Date();
      const due = new Date();
      
      due.setDate(due.getDate() + 30);


      return {

         invoiceNumber : generateInvoiceNumber(),
         issueDate : today.toISOString().split("T")[0],
         dueDate : due.toISOString().split("T")[0],
         currency : "INR",
         taxRate : 0,
         notes : "",
         client : {
           name : "",
           email : "",
           address : "",
           city : "",
           country : "",
         },

         business : {
           name : "",
           email : "",
           address : "",
           city : "",
           country : "",
           logoUrl : "",
         },

         lineItems : [
            {
               id : crypto.randomUUID(),
               description : "",
               quantity : 1,
               rate : 0,
            },
         ],
      };

}


// supported currency 

export const CURRENCIES = [ 
   {code : "INR" , label : "INR - Indian Rupee"},
   {code : "USD" , label : "USD - US Dollar"},
   {code : "EUR" , label : "EUR - Euro"}
];









