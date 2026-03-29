"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DBInvoiceRow } from "../dashboard/page";
import { formatCurrency, calculateTotals } from "@/lib/invoice";
import {
  FileText, CheckCircle, Clock, FilePlus, X,
  Download, Pencil, ChevronRight, IndianRupee,
} from "lucide-react";
import Link from "next/link";



interface Props {
  invoices:  DBInvoiceRow[];
}



const STATUS_BADGE: Record<string, string> = {
  draft:   "bg-ink-100 text-ink-600",
  sent:    "bg-blue-100 text-blue-700",
  paid:    "bg-brand-100 text-brand-700",
  overdue: "bg-red-100 text-red-700",
};

function getTotal(inv: DBInvoiceRow) {
  const items = inv.line_items.map((li : any) => ({
    id: li.id,
    description: li.description,
    quantity: li.quantity,
    rate: li.rate,
  }));
  return calculateTotals(items, inv.tax_rate).total;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}



// ─── Invoice Preview (renders the invoice like the PDF) ──────────────────────


function InvoicePreview({ inv }: { inv: DBInvoiceRow }) {
  const items = inv.line_items.map((li : any) => ({
    id: li.id, description: li.description,
    quantity: li.quantity, rate: li.rate,
  }));

  const { subtotal, taxAmount, total } = calculateTotals(items, inv.tax_rate);
  const fmt = (n: number) => formatCurrency(n, inv.currency);



  return (
    <div className="bg-white rounded-xl border border-ink-100 p-8 text-sm font-[DM_Sans,sans-serif]">


      {/* Header */}


      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 rounded-xl bg-ink-950 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {inv.business_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-ink-950 tracking-tight">Invoice</h2>
          <p className="text-xs text-ink-400 mt-0.5 font-mono">{inv.invoice_number}</p>
          <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${STATUS_BADGE[inv.status] || STATUS_BADGE.draft}`}>
            {inv.status}
          </span>
        </div>
      </div>



      {/* Meta strip */}


      <div className="grid grid-cols-4 gap-4 bg-ink-50 rounded-xl p-4 mb-6">
        {[
          { label: "Issue Date", value: fmtDate(inv.issue_date) },
          { label: "Due Date",   value: fmtDate(inv.due_date) },
          { label: "Amount Due", value: fmt(total) },
          { label: "Currency",   value: inv.currency },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-ink-900">{value}</p>
          </div>
        ))}
      </div>



      {/* Parties */}



      <div className="flex justify-between mb-6">
        <div className="w-[46%]">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400 mb-2">From</p>
          <p className="font-semibold text-ink-900">{inv.business_name}</p>
          <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
            {inv.business_email}<br />
            {inv.business_address}<br />
            {inv.business_city}, {inv.business_country}
          </p>
        </div>
        <div className="w-[46%]">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400 mb-2">Bill To</p>
          <p className="font-semibold text-ink-900">{inv.client_name}</p>
          <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
            {inv.client_email}<br />
            {inv.client_address}<br />
            {inv.client_city}, {inv.client_country}
          </p>
        </div>
      </div>



      {/* Line items */}



      <table className="w-full mb-0">
        <thead>
          <tr className="border-b-2 border-ink-900">
            <th className="text-left text-[10px] font-medium uppercase tracking-wider text-ink-500 pb-2 w-1/2">Description</th>
            <th className="text-right text-[10px] font-medium uppercase tracking-wider text-ink-500 pb-2">Qty</th>
            <th className="text-right text-[10px] font-medium uppercase tracking-wider text-ink-500 pb-2">Rate</th>
            <th className="text-right text-[10px] font-medium uppercase tracking-wider text-ink-500 pb-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.line_items.map((li : any) => (
            <tr key={li.id} className="border-b border-ink-100">
              <td className="py-3 text-sm text-ink-900">{li.description}</td>
              <td className="py-3 text-sm text-right text-ink-600">{li.quantity}</td>
              <td className="py-3 text-sm text-right text-ink-600">{fmt(li.rate)}</td>
              <td className="py-3 text-sm text-right font-medium text-ink-900">{fmt(li.quantity * li.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>



      {/* Totals */}


      <div className="flex justify-end mt-4">
        <div className="w-56 space-y-2">
          <div className="flex justify-between text-sm text-ink-500">
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          {inv.tax_rate > 0 && (
            <div className="flex justify-between text-sm text-ink-500">
              <span>Tax ({inv.tax_rate}%)</span><span>{fmt(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-ink-900 pt-2 font-semibold text-base text-ink-950">
            <span>Total</span><span>{fmt(total)}</span>
          </div>
        </div>
      </div>




      {inv.notes && (
        <div className="mt-6 pt-4 border-t border-ink-100">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400 mb-1">Notes</p>
          <p className="text-xs text-ink-500 whitespace-pre-wrap">{inv.notes}</p>
        </div>
      )}
    </div>
  );
}



// ─── Main Dashboard Client ────────────────────────────────────────────────────



export function DashboardClient({ invoices }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [showList, setShowList]       = useState(false);
  const [preview, setPreview]         = useState<DBInvoiceRow | null>(null);
  const [localInvoices, setLocalInvoices] = useState(invoices);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const total   = localInvoices.length;
  const paid    = localInvoices.filter((i) => i.status === "paid").length;
  const pending = localInvoices.filter((i) => i.status === "sent").length;
  const draft   = localInvoices.filter((i) => i.status === "draft").length;

  const handleMarkPaid = async (inv: DBInvoiceRow) => {
    if (inv.status === "paid") return;
    setMarkingPaid(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (!res.ok) throw new Error("Failed");
      setLocalInvoices((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: "paid" } : i))
      );
      if (preview?.id === inv.id) setPreview({ ...inv, status: "paid" });
      startTransition(() => router.refresh());
    } catch {
      alert("Failed to update status.");
    } finally {
      setMarkingPaid(null);
    }
  };



  const handleDownload = async (inv: DBInvoiceRow) => {
    setDownloading(inv.id);
    try {
      const invoicePayload = {
        invoiceNumber: inv.invoice_number,
        issueDate:     inv.issue_date,
        dueDate:       inv.due_date,
        status:        inv.status,
        currency:      inv.currency,
        taxRate:       inv.tax_rate,
        notes:         inv.notes ?? "",
        client: {
          name: inv.client_name, email: inv.client_email,
          address: inv.client_address, city: inv.client_city, country: inv.client_country,
        },
        business: {
          name: inv.business_name, email: inv.business_email,
          address: inv.business_address, city: inv.business_city, country: inv.business_country,
          logoUrl: inv.business_logo_url ?? "",
        },
        lineItems: inv.line_items,
      };



      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: invoicePayload }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `invoice-${inv.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF.");
    } finally {
      setDownloading(null);
    }
  };




  return (
    <>


   
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FileText,     label: "Total",    value: total,   color: "text-ink-600",    bg: "bg-yellow-300"   },
          { icon: CheckCircle,  label: "Paid",     value: paid,    color: "text-brand-700",  bg: "bg-green-300" },
          { icon: Clock,        label: "Sent",     value: pending, color: "text-blue-700",   bg: "bg-blue-300"  },
          { icon: FilePlus,     label: "Draft",    value: draft,   color: "text-amber-700",  bg: "bg-amber-300" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-ink-950">{value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>



      



      <button
        onClick={() => setShowList(true)}
        className="cursor-pointer w-full flex items-center justify-between bg-white rounded-2xl border border-ink-100 shadow-sm px-6 py-4 hover:bg-ink-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink-100 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-ink-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-ink-900 cursor-pointer">My Invoices</p>
            <p className="text-xs text-ink-400">{total} saved invoice{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-ink-400 group-hover:text-ink-700 transition-colors" />
      </button>

      {/* ── Invoices List Modal ───────────────────────────────────────────── */}



      {showList && (
        <div className="fixed inset-0 z-50 flex" onClick={(e) => e.target === e.currentTarget && setShowList(false)}>
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setShowList(false)} />

          {/* Slide-over panel */}
          <div className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-ink-900">My Invoices</h2>
                <p className="text-xs text-ink-400">{total} total</p>
              </div>
              <button onClick={() => setShowList(false)} className=" cursor-pointer p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-700 transition-colors">
                <X size={16} />
              </button>
            </div>



            {/* List */}


            <div className="flex-1 overflow-y-auto divide-y divide-ink-50">
              {localInvoices.length === 0 ? (
                <div className="py-16 text-center text-ink-400 text-sm">No invoices yet.</div>
              ) : (
                localInvoices.map((inv) => {
                  const tot = getTotal(inv);
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50 transition-colors cursor-pointer"
                      onClick={() => setPreview(inv)}
                    >


                      {/* Invoice info */}



                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-ink-900 truncate">{inv.invoice_number}</p>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${STATUS_BADGE[inv.status] || STATUS_BADGE.draft}`}>
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 truncate">{inv.client_name} · Due {fmtDate(inv.due_date)}</p>
                      </div>



                      {/* Amount */}

                      <p className="text-sm font-semibold text-ink-900 shrink-0">
                        {formatCurrency(tot, inv.currency)}
                      </p>


                  
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Mark as Paid */}
                        {inv.status !== "paid" && (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            disabled={markingPaid === inv.id}
                            title="Mark as Paid"
                            className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
                          >
                            <IndianRupee size={15} />
                          </button>
                        )}
                        {/* Edit */}
                        <Link
                          href={`/invoices/${inv.id}`}
                          title="Edit"
                          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                          onClick={() => setShowList(false)}
                        >
                          <Pencil size={15} />
                        </Link>
                        {/* Download */}
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={downloading === inv.id}
                          title="Download PDF"
                          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors disabled:opacity-50"
                        >
                          {downloading === inv.id ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : (
                            <Download size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-ink-100 shrink-0">
              <Link
                href="/invoices/new"
                onClick={() => setShowList(false)}
                className="w-full flex items-center justify-center gap-2 bg-ink-950 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-ink-800 transition-colors"
              >
                <FilePlus size={15} />
                New Invoice
              </Link>
            </div>
          </div>
        </div>
      )}



      {/* ── Invoice Preview Modal ─────────────────────────────────────────── */}

      
      {preview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setPreview(null)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-ink-50 rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-ink-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${STATUS_BADGE[preview.status] || STATUS_BADGE.draft}`}>
                  {preview.status}
                </span>
                <span className="text-sm font-medium text-ink-900">{preview.invoice_number}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Mark as Paid */}
                {preview.status !== "paid" && (
                  <button
                    onClick={() => handleMarkPaid(preview)}
                    disabled={markingPaid === preview.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
                  >


                    <IndianRupee size={13} />
                    {markingPaid === preview.id ? "Updating…" : "Mark as Paid"}
                  </button>
                )}


                {/* Download */}
                <button
                  onClick={() => handleDownload(preview)}
                  disabled={downloading === preview.id}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-950 text-white text-xs font-medium rounded-lg hover:bg-ink-800 transition-colors disabled:opacity-60"
                >
                  <Download size={13} />
                  {downloading === preview.id ? "…" : "Download PDF"}
                </button>
                {/* Edit */}
                <Link
                  href={`/invoices/${preview.id}`}
                  onClick={() => { setPreview(null); setShowList(false); }}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-100 text-ink-700 text-xs font-medium rounded-lg hover:bg-ink-200 transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </Link>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition-colors cursor-pointer">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <InvoicePreview inv={preview} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}