// main invoice form , app's core part  

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {useForm , Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validations";
import { getDefaultInvoice, CURRENCIES } from "@/lib/invoice";
import { Input, Textarea, Select} from "../ui/Input";
import { Button } from "../ui/Button";
import { LineItemsTable } from "./LineItemsTable";
import { InvoiceSummary } from "./InvoiceSummary";
import { AuthModal } from "../ui/Modal";
import type { InvoiceData } from "@/types/invoice";
import { FileDown, Send, Save, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";



// invoice form props 

interface InvoiceFormProps {
   initialData?: Partial<InvoiceData>;
   isAuthenticated : boolean;
   guestUsed?: boolean;
   invoiceId?: string;
}

type Section = "business" | "client" | "details" | "items" | "notes";


// main invoice form function 

export function InvoiceForm({
    initialData,
    isAuthenticated,
    guestUsed = false,
    invoiceId,
} : InvoiceFormProps) {

    const router = useRouter();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMessage, setAuthMessage] = useState("");
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [emailing, setEmailing] = useState(false);
    const [openSections, setOpenSections] = useState<Set<Section>>(new Set(["business", "client", "details", "items"]));


    const defaults = {...getDefaultInvoice(), ...initialData} as InvoiceFormValues;

    const {register, control, handleSubmit, watch, formState : {errors}} = useForm<InvoiceFormValues>({
       resolver : zodResolver(invoiceSchema) , defaultValues : defaults
    });


    const lineItems = watch("lineItems");
    const taxRate = watch("taxRate");
    const currency = watch("currency");


 // toggle section part of the code 

    const toggleSection = (s : Section) => {
       setOpenSections((prev) => {
         const next = new Set(prev);

         next.has(s) ? next.delete(s) : next.add(s);
         return next;
       });
    };


    //function to generate pdf 

    const generatePDF = async (data : InvoiceFormValues) => {
       
      if(!isAuthenticated && guestUsed){
        setAuthMessage("You've used your free invoice. Create an account to generate more.");
        setShowAuthModal(true);
        return;
      }

      setGenerating(true);

      try {

         const res = await fetch("/api/generate-pdf", {
           method : "POST",
           headers : {"Content-Type" : "application/json"},
           body : JSON.stringify({invoice : data}),
         });


         if(!res.ok) throw new Error("PDF generation failed");

         const blob = await res.blob();

         const url = URL.createObjectURL(blob);

         const a = document.createElement("a");

         a.href = url;
         a.download = `invoice-${data.invoiceNumber}.pdf`;
         a.click();
         URL.revokeObjectURL(url);


         // marking guest , if it is not authenticated 

         if(!isAuthenticated) {
           localStorage.setItem("invoiceflow-guest-used", "true");
         }

      } catch {
         alert("Failed to generate PDF. Please try again.");
      } finally {
         setGenerating(false);
      }

    };



    // saving the invoice 

    const saveInvoice = async (data : InvoiceFormValues) => {
        
       if(!isAuthenticated) {
        setAuthMessage("Sign in to save your invoices and access them anytime.");
        setShowAuthModal(true);
        return;
       }

       setSaving(true);

       try {

          const res = await fetch(invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices" , {
             method : invoiceId ? "PUT" : "POST",
             headers : {"Content-Type" : "application/json"},
             body : JSON.stringify({invoice : data}),
          });

          if(!res.ok) throw new Error("Save failed");

          const json = await res.json();

          router.push(`/invoices/${json.id}`);

       } catch {
          alert("Failed to save invoice.");
       } finally {
          setSaving(false);
       }

    };




    // send email function 

    const sendEmail = async (data : InvoiceFormValues) => {
       
        if(!isAuthenticated) {
          setShowAuthModal(true);
          return;
        }

        setEmailing(true);

        try {
           const res = await fetch("/api/send-email", {
             method : "POST",
             headers : {"Content-Type": "application/json"},
             body : JSON.stringify({invoice : data}),
           });


           if(!res.ok) throw new Error("Email failed");

           alert(`Invoice sent ot ${data.client.email}`);
        } catch  {
           alert("Failed to send email");
        }
          finally {
             setEmailing(false);
          }

    };





    // header for each section 

    const SectionHeader = ({id, title, subtitle} : {id : Section; title : string; subtitle?: string;}) => (
       
      <button type="button" onClick={() => toggleSection(id)} className="w-full flex items-center justify-between py-3 text-left group">

        <div>

          <h3 className="text-sm font-semibold text-ink-900 group-hover:text-ink-700">
            {title}
          </h3>

          {
            subtitle && (
               <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>
            )
          }

        </div>

        {openSections.has(id) ? (
           <ChevronUp size={15} className="text-ink-400 shrink-0"/>
        ) : (
           <ChevronDown size={15} className="text-ink-400 shrink-0"/>
        )}

      </button>

    );



    return (

        <>

        <form className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          <div className="space-y-3">

              {/* invoice details  */}

              <div className="bg-white rounded-2xl border border-ink-200">

              </div>


             
          </div>

        </form>




        </>
       
    )

  



















     

   
}













