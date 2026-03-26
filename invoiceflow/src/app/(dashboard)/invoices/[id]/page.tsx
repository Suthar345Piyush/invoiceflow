// edit and  invoice details 



import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import type { InvoiceData } from "@/types/invoice";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


interface PageProps {
    params : Promise<{id : string}>;
}



export default async function InvoiceDetailPage({params} : PageProps) {

    const {id} = await params;

    const supabase = await createClient();

    const {data : invoice, error} = await supabase.from("invoices").selec("*, line_items(*)").eq("id", id).single();


    if(error || !invoice) notFound();


    const invoiceData: InvoiceData = {
        id : invoice.id,
        invoiceNumber : invoice.invoice_number,
        issueDate : invoice.issue_date,
        dueDate : invoice.due_date,
        status : invoice.status,
        currency : invoice.currency,
        taxRate : invoice.tax_rate,
        notes: invoice.notes ?? "",
        client : {
           name : invoice.client_name,
           email : invoice.client_email,
           address : invoice.client_address,
           city : invoice.client_city,
           country : invoice.client_country,
        },

        business : {
          name : invoice.business_name,
          email : invoice.business_email,
          address : invoice.business_address,
          city : invoice.business_city,
          country : invoice.business_country,
          logoUrl : invoice.business_logo_url ?? "",
        },

        lineItems : (invoice.line_items ?? []).map(
          (li : {id : string; description: string; quantity : number; rate: number}) => ({
             id : li.id,
             description : li.description,
             quantity : li.quantity,
             rate : li.rate,
          })
        ),
    };



    return (

       <div className="space-y-6 animate-fade-up">

        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-4 transition-colors">

            <ArrowLeft size={14}/>
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-semibold text-ink-950">{invoice.invoice_number}</h1>
       <p className="text-sm text-ink-400 mt-0.5">Edit and re-download or resend this invoice.</p>

        </div>

        <InvoiceForm initialData={invoiceData} isAuthenticated={true} invoiceId={id}/>






       </div>

    )








   
}

