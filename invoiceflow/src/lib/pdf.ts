import type { InvoiceData } from "@/types/invoice";
import { calculateTotals, formatCurrency } from "@/lib/invoice";
import type { TemplateId } from "@/types/supabase";



export function renderInvoiceHTML(invoice: InvoiceData, templateId: TemplateId = "classic"): string {
  switch (templateId) {
    case "modern":  return renderModern(invoice);
    case "minimal": return renderMinimal(invoice);
    default:        return renderClassic(invoice);
  }
}



function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}



function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}



function lineItemsHTML(invoice: InvoiceData, fmt: (n: number) => string): string {
  return invoice.lineItems.map((item) => `
    <tr>
      <td class="desc">${escapeHtml(item.description)}</td>
      <td class="num">${item.quantity}</td>
      <td class="num">${fmt(item.rate)}</td>
      <td class="num">${fmt(item.quantity * item.rate)}</td>
    </tr>`).join("");
}


// classic invoice template 


function renderClassic(invoice: InvoiceData): string {
  const { subtotal, taxAmount, total } = calculateTotals(invoice.lineItems, invoice.taxRate);
  const fmt = (n: number) => formatCurrency(n, invoice.currency);
  const logoHTML = invoice.business.logoUrl
    ? `<img src="${invoice.business.logoUrl}" alt="Logo" class="logo" />`
    : `<div class="logo-placeholder">${escapeHtml(invoice.business.name.charAt(0).toUpperCase())}</div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'DM Sans',sans-serif; font-size:13px; color:#1c1a17; background:#fff; padding:56px 64px; line-height:1.6; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:48px; }
    .logo { width:64px; height:64px; object-fit:contain; border-radius:8px; }
    .logo-placeholder { width:56px; height:56px; background:#052e16; color:#f0fdf4; font-size:24px; font-weight:600; border-radius:10px; display:flex; align-items:center; justify-content:center; }
    .invoice-label { text-align:right; }
    .invoice-label h1 { font-size:28px; font-weight:600; letter-spacing:-0.02em; color:#052e16; }
    .inv-number { font-family:'DM Mono',monospace; font-size:12px; color:#706a60; margin-top:4px; }
    .meta-row { display:flex; gap:40px; margin-bottom:48px; padding:24px; background:#f8f8f7; border-radius:12px; }
    .meta-block { flex:1; }
    .meta-block .label { font-size:10px; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; color:#a9a39a; margin-bottom:6px; }
    .meta-block .value { font-size:13px; color:#1c1a17; font-weight:500; }
    .parties { display:flex; justify-content:space-between; margin-bottom:40px; }
    .party { width:46%; }
    .party .label { font-size:10px; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; color:#a9a39a; margin-bottom:8px; }
    .party .name { font-size:15px; font-weight:600; color:#1c1a17; margin-bottom:2px; }
    .party .detail { font-size:12px; color:#706a60; line-height:1.7; }
    table { width:100%; border-collapse:collapse; }
    thead tr { border-bottom:1.5px solid #1c1a17; }
    thead th { font-size:10px; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; color:#706a60; padding:0 0 10px 0; text-align:left; }
    thead th.num { text-align:right; }
    tbody tr { border-bottom:1px solid #e2e0db; }
    tbody td { padding:12px 0; font-size:13px; color:#1c1a17; }
    td.desc { width:50%; }
    td.num { text-align:right; color:#3d3a36; }
    .totals-wrap { display:flex; justify-content:flex-end; margin-top:20px; }
    .totals { width:260px; }
    .totals-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#706a60; }
    .totals-row.total { border-top:1.5px solid #1c1a17; margin-top:8px; padding-top:12px; font-size:16px; font-weight:600; color:#1c1a17; }
    .notes-section { margin-top:48px; padding-top:24px; border-top:1px solid #e2e0db; }
    .notes-section .label { font-size:10px; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; color:#a9a39a; margin-bottom:8px; }
    .notes-section p { font-size:12px; color:#706a60; line-height:1.7; white-space:pre-wrap; }
    .footer { margin-top:56px; padding-top:16px; border-top:1px solid #e2e0db; display:flex; justify-content:space-between; font-size:11px; color:#a9a39a; }
  </style></head><body>
  <div class="header">
    ${logoHTML}
    <div class="invoice-label">
      <h1>Invoice</h1>
      <div class="inv-number">${escapeHtml(invoice.invoiceNumber)}</div>
    </div>
  </div>
  <div class="meta-row">
    <div class="meta-block"><div class="label">Issue Date</div><div class="value">${formatDate(invoice.issueDate)}</div></div>
    <div class="meta-block"><div class="label">Due Date</div><div class="value">${formatDate(invoice.dueDate)}</div></div>
    <div class="meta-block"><div class="label">Amount Due</div><div class="value">${fmt(total)}</div></div>
    <div class="meta-block"><div class="label">Currency</div><div class="value">${escapeHtml(invoice.currency)}</div></div>
  </div>
  <div class="parties">
    <div class="party">
      <div class="label">From</div>
      <div class="name">${escapeHtml(invoice.business.name)}</div>
      <div class="detail">${escapeHtml(invoice.business.email)}<br/>${escapeHtml(invoice.business.address)}<br/>${escapeHtml(invoice.business.city)}, ${escapeHtml(invoice.business.country)}</div>
    </div>
    <div class="party">
      <div class="label">Bill To</div>
      <div class="name">${escapeHtml(invoice.client.name)}</div>
      <div class="detail">${escapeHtml(invoice.client.email)}<br/>${escapeHtml(invoice.client.address)}<br/>${escapeHtml(invoice.client.city)}, ${escapeHtml(invoice.client.country)}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
    <tbody>${lineItemsHTML(invoice, fmt)}</tbody>
  </table>
  <div class="totals-wrap"><div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    ${invoice.taxRate > 0 ? `<div class="totals-row"><span>Tax (${invoice.taxRate}%)</span><span>${fmt(taxAmount)}</span></div>` : ""}
    <div class="totals-row total"><span>Total</span><span>${fmt(total)}</span></div>
  </div></div>
  ${invoice.notes ? `<div class="notes-section"><div class="label">Notes</div><p>${escapeHtml(invoice.notes)}</p></div>` : ""}
  <div class="footer"><span>Generated by Invoiceflow</span><span>${escapeHtml(invoice.business.email)}</span></div>
  </body></html>`;
}



// modern invoice template 

function renderModern(invoice: InvoiceData): string {
  const { subtotal, taxAmount, total } = calculateTotals(invoice.lineItems, invoice.taxRate);
  const fmt = (n: number) => formatCurrency(n, invoice.currency);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; font-size:13px; color:#111827; background:#fff; line-height:1.6; }
    .header { background:#111827; color:#fff; padding:40px 56px; display:flex; justify-content:space-between; align-items:center; }
    .brand { display:flex; align-items:center; gap:12px; }
    .brand-initial { width:44px; height:44px; background:#22c55e; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; color:#fff; }
    .brand-name { font-size:16px; font-weight:600; color:#fff; }
    .brand-email { font-size:12px; color:#9ca3af; }
    .header-right { text-align:right; }
    .invoice-title { font-size:32px; font-weight:700; color:#fff; letter-spacing:-0.03em; }
    .invoice-num { font-size:12px; color:#6b7280; font-family:monospace; margin-top:4px; }
    .body { padding:40px 56px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:40px; }
    .info-card { background:#f9fafb; border-radius:10px; padding:20px; }
    .info-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#6b7280; margin-bottom:10px; }
    .info-name { font-size:15px; font-weight:600; color:#111827; margin-bottom:4px; }
    .info-detail { font-size:12px; color:#6b7280; line-height:1.8; }
    .meta-strip { display:flex; gap:0; margin-bottom:40px; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }
    .meta-item { flex:1; padding:16px 20px; border-right:1px solid #e5e7eb; }
    .meta-item:last-child { border-right:none; }
    .meta-item .label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:4px; }
    .meta-item .value { font-size:14px; font-weight:600; color:#111827; }
    .meta-item .value.green { color:#16a34a; }
    table { width:100%; border-collapse:collapse; margin-bottom:0; }
    thead tr { background:#111827; }
    thead th { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; padding:12px 16px; text-align:left; }
    thead th.num { text-align:right; }
    tbody tr { border-bottom:1px solid #f3f4f6; }
    tbody tr:nth-child(even) { background:#f9fafb; }
    tbody td { padding:13px 16px; font-size:13px; color:#374151; }
    td.num { text-align:right; }
    .totals-section { display:flex; justify-content:flex-end; margin-top:24px; }
    .totals-box { width:280px; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }
    .totals-row { display:flex; justify-content:space-between; padding:10px 16px; font-size:13px; color:#6b7280; border-bottom:1px solid #f3f4f6; }
    .totals-row.grand { background:#111827; color:#fff; font-size:15px; font-weight:700; border-bottom:none; padding:14px 16px; }
    .totals-row.grand .amt { color:#22c55e; }
    .notes { margin-top:40px; padding:20px; background:#f9fafb; border-radius:10px; border-left:4px solid #22c55e; }
    .notes .label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#6b7280; margin-bottom:6px; }
    .notes p { font-size:12px; color:#6b7280; white-space:pre-wrap; }
    .footer { margin-top:40px; padding:16px 56px; background:#f9fafb; display:flex; justify-content:space-between; font-size:11px; color:#9ca3af; border-top:1px solid #e5e7eb; }
  </style></head><body>
  <div class="header">
    <div class="brand">
      <div class="brand-initial">${escapeHtml(invoice.business.name.charAt(0).toUpperCase())}</div>
      <div><div class="brand-name">${escapeHtml(invoice.business.name)}</div><div class="brand-email">${escapeHtml(invoice.business.email)}</div></div>
    </div>
    <div class="header-right">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-num">${escapeHtml(invoice.invoiceNumber)}</div>
    </div>
  </div>
  <div class="body">
    <div class="meta-strip">
      <div class="meta-item"><div class="label">Issue Date</div><div class="value">${formatDate(invoice.issueDate)}</div></div>
      <div class="meta-item"><div class="label">Due Date</div><div class="value">${formatDate(invoice.dueDate)}</div></div>
      <div class="meta-item"><div class="label">Amount Due</div><div class="value green">${fmt(total)}</div></div>
      <div class="meta-item"><div class="label">Currency</div><div class="value">${escapeHtml(invoice.currency)}</div></div>
    </div>
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">From</div>
        <div class="info-name">${escapeHtml(invoice.business.name)}</div>
        <div class="info-detail">${escapeHtml(invoice.business.email)}<br/>${escapeHtml(invoice.business.address)}<br/>${escapeHtml(invoice.business.city)}, ${escapeHtml(invoice.business.country)}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Bill To</div>
        <div class="info-name">${escapeHtml(invoice.client.name)}</div>
        <div class="info-detail">${escapeHtml(invoice.client.email)}<br/>${escapeHtml(invoice.client.address)}<br/>${escapeHtml(invoice.client.city)}, ${escapeHtml(invoice.client.country)}</div>
      </div>
    </div>
    <table>
      <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
      <tbody>${lineItemsHTML(invoice, fmt)}</tbody>
    </table>
    <div class="totals-section"><div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      ${invoice.taxRate > 0 ? `<div class="totals-row"><span>Tax (${invoice.taxRate}%)</span><span>${fmt(taxAmount)}</span></div>` : ""}
      <div class="totals-row grand"><span>Total</span><span class="amt">${fmt(total)}</span></div>
    </div></div>
    ${invoice.notes ? `<div class="notes"><div class="label">Notes</div><p>${escapeHtml(invoice.notes)}</p></div>` : ""}
  </div>
  <div class="footer"><span>Invoiceflow</span><span>${escapeHtml(invoice.business.email)}</span></div>
  </body></html>`;
}



// minimal invoice template 


function renderMinimal(invoice: InvoiceData): string {
  const { subtotal, taxAmount, total } = calculateTotals(invoice.lineItems, invoice.taxRate);
  const fmt = (n: number) => formatCurrency(n, invoice.currency);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Lato',sans-serif; font-size:13px; color:#2d2d2d; background:#fff; padding:64px 72px; line-height:1.7; }
    .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:64px; }
    .brand { font-size:22px; font-weight:700; color:#2d2d2d; letter-spacing:-0.02em; }
    .brand-sub { font-size:12px; color:#999; margin-top:2px; font-weight:300; }
    .invoice-tag { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; color:#999; }
    .invoice-num { font-size:24px; font-weight:700; color:#2d2d2d; margin-top:4px; letter-spacing:-0.02em; }
    .divider { height:1px; background:#e8e8e8; margin-bottom:40px; }
    .parties { display:flex; justify-content:space-between; margin-bottom:48px; }
    .party .label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#bbb; margin-bottom:10px; }
    .party .name { font-size:14px; font-weight:700; color:#2d2d2d; margin-bottom:4px; }
    .party .detail { font-size:12px; color:#888; line-height:1.8; font-weight:300; }
    .dates { display:flex; gap:48px; margin-bottom:40px; padding:20px 0; border-top:1px solid #e8e8e8; border-bottom:1px solid #e8e8e8; }
    .date-item .label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#bbb; margin-bottom:4px; }
    .date-item .value { font-size:13px; font-weight:400; color:#2d2d2d; }
    .date-item .value.amount { font-size:18px; font-weight:700; }
    table { width:100%; border-collapse:collapse; margin-bottom:0; }
    thead th { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#bbb; padding:0 0 12px 0; text-align:left; border-bottom:1px solid #2d2d2d; }
    thead th.num { text-align:right; }
    tbody td { padding:14px 0; font-size:13px; color:#2d2d2d; border-bottom:1px solid #f0f0f0; font-weight:300; }
    td.desc { font-weight:400; }
    td.num { text-align:right; }
    .totals-wrap { display:flex; justify-content:flex-end; margin-top:24px; }
    .totals { width:240px; }
    .t-row { display:flex; justify-content:space-between; padding:5px 0; font-size:12px; color:#888; font-weight:300; }
    .t-row.final { padding-top:12px; margin-top:8px; border-top:1px solid #2d2d2d; font-size:15px; font-weight:700; color:#2d2d2d; }
    .notes-block { margin-top:48px; }
    .notes-block .label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#bbb; margin-bottom:8px; }
    .notes-block p { font-size:12px; color:#888; font-weight:300; white-space:pre-wrap; line-height:1.8; }
    .footer { margin-top:64px; display:flex; justify-content:space-between; font-size:10px; color:#ccc; font-weight:300; border-top:1px solid #f0f0f0; padding-top:16px; }
  </style></head><body>
  <div class="top">
    <div>
      <div class="brand">${escapeHtml(invoice.business.name)}</div>
      <div class="brand-sub">${escapeHtml(invoice.business.email)}</div>
    </div>
    <div style="text-align:right">
      <div class="invoice-tag">Invoice</div>
      <div class="invoice-num">${escapeHtml(invoice.invoiceNumber)}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="parties">
    <div class="party">
      <div class="label">From</div>
      <div class="name">${escapeHtml(invoice.business.name)}</div>
      <div class="detail">${escapeHtml(invoice.business.address)}<br/>${escapeHtml(invoice.business.city)}, ${escapeHtml(invoice.business.country)}</div>
    </div>
    <div class="party" style="text-align:right">
      <div class="label">Bill To</div>
      <div class="name">${escapeHtml(invoice.client.name)}</div>
      <div class="detail">${escapeHtml(invoice.client.email)}<br/>${escapeHtml(invoice.client.address)}<br/>${escapeHtml(invoice.client.city)}, ${escapeHtml(invoice.client.country)}</div>
    </div>
  </div>
  <div class="dates">
    <div class="date-item"><div class="label">Issue Date</div><div class="value">${formatDate(invoice.issueDate)}</div></div>
    <div class="date-item"><div class="label">Due Date</div><div class="value">${formatDate(invoice.dueDate)}</div></div>
    <div class="date-item"><div class="label">Amount Due</div><div class="value amount">${fmt(total)}</div></div>
  </div>
  <table>
    <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
    <tbody>${lineItemsHTML(invoice, fmt)}</tbody>
  </table>
  <div class="totals-wrap"><div class="totals">
    <div class="t-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    ${invoice.taxRate > 0 ? `<div class="t-row"><span>Tax (${invoice.taxRate}%)</span><span>${fmt(taxAmount)}</span></div>` : ""}
    <div class="t-row final"><span>Total</span><span>${fmt(total)}</span></div>
  </div></div>
  ${invoice.notes ? `<div class="notes-block"><div class="label">Notes</div><p>${escapeHtml(invoice.notes)}</p></div>` : ""}
  <div class="footer"><span>Invoiceflow</span><span>${escapeHtml(invoice.business.email)}</span></div>
  </body></html>`;
}