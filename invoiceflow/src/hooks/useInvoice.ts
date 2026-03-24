// use invoice hook using zustand for storing the guest and auth state 

'use client';

import {create} from "zustand";
import  { persist  }from "zustand/middleware";
import type { InvoiceData } from "@/types/invoice";
import { getDefaultInvoice } from "@/lib/invoice";



interface InvoiceStore {
   draft : InvoiceData;
   guestUsed : boolean;    // guest chance used or not  
   setDraft : (data : Partial<InvoiceData>) => void;
   resetDraft : () => void;
   markGuestUsed : () => void;
}


export const useInvoiceStore = create<InvoiceStore>() (
     persist(
       (set) => ({

         draft : getDefaultInvoice() as InvoiceData,
         guestUsed : false,
         

         setDraft : (data) => 
           set((state) => ({draft : {...state.draft , ...data}})),


         resetDraft : () => set({draft : getDefaultInvoice() as InvoiceData}),


         markGuestUsed : () => set({guestUsed : true}),


       }),


       {
         name : "invoiceflow-draft",
       }
     )
)

