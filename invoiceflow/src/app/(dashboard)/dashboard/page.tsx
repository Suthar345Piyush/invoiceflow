// dashboard page with invoice list and stats 

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {FilePlus, FileText, IndianRupeeIcon, Clock, CheckCircle, Icon} from "lucide-react";
import { formatCurrency } from "@/lib/invoice";


interface DBInvoiceRow {
   id : string;
   invoice_number : string;
   due_date : string;
   status : string;
   currency : string;
   tax_rate : number;
   business_name : string;
   client_name : string;
   line_items : {quantity : number, rate : number}[];
}



export default async function DashboardPage() {
    const supabase = await createClient();

    const {data : {user}} = await supabase.auth.getUser();

    const {data } = await supabase.from("invoices").select("*, line_items(*)").eq("user_id", user!.id).order("created_at", {ascending : false});
    
    
    const rows = (data ?? []) as unknown as DBInvoiceRow[];
    

    // computing some stats 

    const total = rows.length;
    const paid = rows.filter((i : any) => i.status === "paid").length;
    const pending  = rows.filter((i : any) => i.status === "sent").length;


// colors for each type of status  

    const STATUS_COLOR: Record<string, string> = {
        draft: "bg-ink-100 text-ink-600",
        sent: "bg-blue-100 text-blue-700",
        paid : "bg-brand-100 text-brand-700",
        overdue : "bg-red-100 text-red-700",
    };


    return (

        <div className="space-y-8 animate-fade-up">

          <div className="flex items-center justify-between">
            <div>

              <h1 className="text-2xl font-semibold text-ink-950">Dashboard</h1>

              <p className="text-sm text-ink-400 mt-0.5">

                Welcome back,{" "}
                {user?.user_metadata?.full_name?.split(" ")[0] || "there"}

              </p>
            </div>

            <Link href="/invoice/new" className="inline-flex items-center gap-2 bg-ink-950 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-ink-800 transition-colors">

              <FilePlus size={15}/>
              New Invoice

            </Link>

          </div>


          {/* stats  */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon : FileText,
                label : "Total Invoices",
                value : total,
                color : "text-ink-600",
                bg:"bg-ink-100"
              },

              {
                icon : CheckCircle,
                label : "Paid",
                value : total,
                color : "text-brand-700",
                bg:"bg-brand-100"
              },

              {
                icon : Clock,
                label : "Awaiting Payment",
                value : pending,
                color : "text-blue-700",
                bg:"bg-brand-100"
              }
            ].map(({icon : Icon, label, value, color, bg}) => (
               
               <div key={label} className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 items-center gap-4">


                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>

                  <Icon size={18} className={color}/>

                  </div>

                  <div>
                    <p className="text-2xl font-semibold text-ink-950">{value}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{label}</p>

                    </div>
                </div>
            ))}

          </div>



          {/* invoice tables   */}

          <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Your Invoices</h2>
              <span className="text-xs text-ink-400">{total} total</span>
            </div>


            {rows.length === 0 ? (

              <div className="py-16 text-center">
                <div className="w-12 h-12  bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">

                  <FileText size={20} className="text-ink-400"/>

                  </div>

                  <p className="text-sm font-medium text-ink-700">No invoices yet!!</p>
                  <p className="text-xs text-ink-400 mt-1">Create your first invoice to get started</p>

                  <Link href="/invoices/new" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-ink-900 hover:underline">

                    <FilePlus size={14}/>
                    Create Invoice
                  </Link>

                </div>
            ) : (

              <div className="divide-y divide-ink-50">

                {/* table header part  */}

                <div className="grid grid-cols-[1fr_140px_120px_80px_80px] gap-4 px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-ink-400">

                  <span>Invoice</span>
                  <span>Client</span>
                  <span>Due Date</span>
                  <span>Amount</span>
                  <span>Status</span>

                  </div>


                  {rows.map((invoice : any) => {

                      // calculate total from line items

                      const subtotal = (invoice.line_items ?? []).reduce(
                        (s : number, item: {quantity : number; rate: number}) => s + item.quantity * item.rate, 0
                      );

                      const total = subtotal * (1 + invoice.tax_rate / 100);


                      return (

                        <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="grid grid-cols-[1fr_140px_120px_80px_80px] gap-4 px-6 py-4 items-center hover:bg-ink-50 transition-colors">

                          <div>
                            <p className="text-sm font-medium text-ink-900">{invoice.invoice_number}</p>

                            <p className="text-xs text-ink-400 mt-0.5 truncate">{invoice.business_name}</p>

                          </div>

                          <p className="text-sm text-ink-400">{invoice.client_name}</p>


                          <p className="text-sm text-ink-600">
                            {new Date(invoice.due_date).toLocaleDateString("en-IN", {
                               month : "short",
                               day : "numeric",
                               year: "numeric",
                            })}

                          </p>

                          <p className="text-sm font-medium text-ink-900">{formatCurrency(total, invoice.currency)}</p>


                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase ${STATUS_COLOR[invoice.status] || STATUS_COLOR.draft}`}>

                            {invoice.status}

                          </span>

                        </Link>
                         
                      )

                  })}
                </div>

            )}

          </div>


        </div>

    )

}
