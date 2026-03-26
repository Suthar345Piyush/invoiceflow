// new invoice page for authenticated users 

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewInvoicePage() {
    return (
       <div className="space-y-4 animate-fade-up">

        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-4 transition-colors">

            <ArrowLeft size={14}/>
            Back to dashboard
          
          </Link>

          <h1 className="text-2xl font-semibold text-ink-950">New Invoice</h1>

          <p className="text-sm text-ink-400 mt-0.5">Fill in the details and download or send your invoice</p>

        </div>

        <InvoiceForm isAuthenticated={true}/>

       </div>
    )
}