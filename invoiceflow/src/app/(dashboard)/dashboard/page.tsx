import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import { DashboardClient } from "./DashboardClient";

export interface DBInvoiceRow {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  currency: string;
  tax_rate: number;
  notes: string | null;
  business_name: string;
  business_email: string;
  business_address: string;
  business_city: string;
  business_country: string;
  business_logo_url: string | null;
  client_name: string;
  client_email: string;
  client_address: string;
  client_city: string;
  client_country: string;
  line_items: { id: string; description: string; quantity: number; rate: number }[];
}


export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("invoices")
    .select("*, line_items(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });


  const rows = (data ?? []) as unknown as DBInvoiceRow[];


  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-950">Dashboard</h1>
          <p className="text-sm text-ink-400 mt-0.5">

  
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "there"}


          </p>
        </div>


        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-ink-950 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-ink-800 transition-colors"
        >


          <FilePlus size={15} />
          New Invoice
        </Link>
      </div>

      <DashboardClient invoices={rows} />
    </div>
  );
}