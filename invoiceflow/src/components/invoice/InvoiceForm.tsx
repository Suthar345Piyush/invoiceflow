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

              <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
                <div className="px-5 border-b border-ink-100">

                  <SectionHeader id="details" title="Invoice Details" subtitle="Number, dates & currency"/>

                </div>

                {openSections.has("details") && (

                   <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <Input label="Invoice Number" {...register("invoiceNumber")} error={errors.invoiceNumber?.message} placeholder="INV-2025-001"/>

                    <Input type="date" label="Issue Date" {...register("issueDate")} error={errors.issueDate?.message}/>

                    <Input label="Due Date" {...register("dueDate")} error={errors.dueDate?.message} type="date"/>


                    <Controller name="currency" control={control} render={({field}) => (
                       
                        <Select label="Currency" options={CURRENCIES.map((c) => ({
                           value : c.code,
                           label : c.label,
                        }))} {...field} />

                    )}/>

                    <Input label="Tax Rate (%)" type="number" min="0" max="100" step="0.1" {...register("taxRate", {valueAsNumber : true})} placeholder="0" />

                    </div>
                )}

              </div>

              {/* business info  */}

              <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
                <div className="px-5 border-b border-ink-100">

                  <SectionHeader id="business" title="Your Business" subtitle="Sender information"/>

                </div>

                {openSections.has("business") && (

                       <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <Input label="Business Name" {...register("business.name")} error={errors.business?.name?.message} placeholder="Wonix Studio"/>

                  <Input type="email" label="Email" {...register("business.email")} error={errors.business?.email?.message} placeholder="wonix@studio.com"/>

                  <Input label="Address" {...register("business.address")} placeholder="123 Main Street"/>

                  <Input label="City" {...register("business.city")} placeholder="Mumbai"/>

                  <Input label="Country" {...register("business.country")} placeholder="India"/>

                  <Input label="Logo URL (optional)" {...register("business.logoUrl")} placeholder="https://..."/>

           </div>
         )}
      </div>


      {/* client information  */}

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
                <div className="px-5 border-b border-ink-100">

                  <SectionHeader id="client" title="Bill To" subtitle="Client information"/>

                </div>

                {openSections.has("client") && (

                       <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Input label="Client Name" {...register("client.name")} error={errors.client?.name?.message} placeholder="Alex Wayne"/>

                  <Input type="email" label="Client Email" {...register("client.email")} error={errors?.client?.email?.message} placeholder="john@company.com"/>

                  <Input label="Address" {...register("client.address")} placeholder="123 Main Street"/>

                  <Input label="City" {...register("client.city")} placeholder="Mumbai"/>

                  <Input label="Country" {...register("client.country")} placeholder="India"/>

           </div>
         )}
      </div>



      {/* line items  */}

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">

        <div className="px-5 border-b border-ink-100">

           <SectionHeader id="items" title="Line Items" subtitle="Services or products"/>
        </div>

        {openSections.has("items") && (

           <div className="p-5">
            
             <Controller name="lineItems"  control={control} render={({field}) => (
      
              <LineItemsTable items={field.value} currency={currency} onChange={field.onChange}/>
    

             )}/>
            
            </div>
        )}

      </div>


      {/* same for notes  */}


      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">

        <div className="px-5 border-b border-ink-100">

           <SectionHeader id="notes" title="Notes" subtitle="Payment terms, thank you message, etc."/>
        </div>

        {openSections.has("notes") && (

           <div className="p-5">

            <Textarea {...register("notes")} rows={3} placeholder="e.g. Payment due within 30 days. Thank you for your business!"/>
             
        
            </div>
        )}

      </div>

          </div>


          {/* summary and actions   */}

          <div>
            <InvoiceSummary lineItems={lineItems} taxRate={taxRate} currency={currency}/>

            {/* guest page indicator  */}

            {!isAuthenticated && !guestUsed && (

              <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-xs text-t-brand-800">

                <span className="font-semibold">Free preview:</span> Download 1 invoice without signing up.

                </div>

            )}

            {/* cta (call to action) buttons  */}

            <div className="space-y-2">

              <Button type="button" onClick={handleSubmit(generatePDF)} loading={generating} size="lg" className="w-full">

                <FileDown size={16}/>

                {generating ? "Generating..." : "Download PDF"}

              </Button>

              {/* save invoice button  */}

              <Button type="button" onClick={handleSubmit(saveInvoice)} loading={saving} size="lg" className="w-full">

                <Save size={16}/>

                {saving ? "saving..." : "Save Invoice"}
 
              </Button>


              {isAuthenticated && (

                <Button className="w-full" type="button" variant="ghost" onClick={handleSubmit(sendEmail)} loading={emailing} size="lg">

                  <Send size={16}/>

                  {emailing ? "Sending..." : "Send to Client"}

                </Button>
                 
              )}

            </div>

            {!isAuthenticated && (

              <p className="text-xs text-ink-400 text-center">

                <button type="button" onClick={() => setShowAuthModal(true)} className="text-ink-600 font-medium hover:underline"> Sign up free</button>{" "}to save, manage & email invoices
                
                  </p>
                )}
          </div>

        </form>

        <AuthModal open={showAuthModal}  onClose={() => setShowAuthModal(false)} message={authMessage || undefined} onSuccess={() => router.refresh()}/>

        </>
    )
   
}













