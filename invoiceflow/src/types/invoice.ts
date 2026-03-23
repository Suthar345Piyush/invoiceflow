// global types for  invoice 

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface LineItem {
  id : string;
  description : string;
  quantity : number;
  rate : number;
}


export interface ClientInfo {
   name : string;
   email : string;
   address : string;
   city : string;
   country : string;
}

export interface BusinessInfo {
   name : string;
   email : string;
   address : string;
   city : string;
   country : string;
   logoUrl?: string;
}


export interface InvoiceData {
   id? : string;
   invoiceNumber : string;
   issueDate : string;
   dueDate : string;
   status?: InvoiceStatus;
   client : ClientInfo;
   business: BusinessInfo;
   lineItems : LineItem[];
   taxRate : number;
   notes?: string;
   currency : string;
}


export interface InvoiceTotals {
   subtotal : number;
   taxAmount : number;
   total : number;
}






