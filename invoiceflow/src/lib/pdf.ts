// puppeteer pdf generation helper (raw HTML code)

import type { InvoiceData } from "@/types/invoice";
import { calculateTotals , formatCurrency } from "./invoice";



// rendering the invoice as HTML string for puppeteer 

export function renderInvoiceHTML(invoice : InvoiceData) : string {
      
    const {subtotal , taxAmount , total} = calculateTotals(
       invoice.lineItems,
       invoice.taxRate,   
    );

    const fmt = (n : number) => formatCurrency(n , invoice.currency);


    const  lineItemsHTML = invoice.lineItems.map((item) => `

      <tr>
        <td class="desc">${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${fmt(item.rate)}</td>
        <td class="num">${fmt(item.quantity * item.rate)}</td>
      </tr>
    `).join("");


    const logoHTML = invoice.business.logoUrl ? `<img src="${invoice.business.logoUrl}" alt="Logo" class="logo"/>` : `<div class="logo-placeholder">${escapeHtml(invoice.business.name.charAt(0).toUpperCase())}</div>`;


    return `<!DOCTYPE html>
     <html lang="en">
     <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
      <style>
       @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

       * {
        margin : 0;
        padding : 0;
        box-sizing : border-box;
         }

         body {
            font-family : 'DM Sans', sans-serif;
            font-size : 13px;
            color : #1c1a17;
            background : #ffffff;
            padding : 56px 64px;
            line-height : 1.6;
         }


        /* header */

        .header {
           display : flex;
           justify-content : space-between;
           align-items : flex-start;
           margin-bottom : 48px;
        }

        .logo {
           widht : 64px;
           height : 56px;
           background : #052e16;
           border-radius: 8px;
        }

        .logo-placeholder {
          width: 56px;
          height: 56px;
          background: #052e16;
          color: #f0fdf4;
          font-size: 24px;
          font-weight: 600;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .invoice-label {
          text-align: right;
        }

        .invoice-label h1 {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #052e16;
        }


        .invoice-label .inv-number {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #706a60;
          margin-top: 4px;
        }

     
        /* Status badge */

        .status {
          display: inline-block;
          margin-top: 8px;
          padding: 2px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          background: #dcfce7;
          color: #14532d;
        }
     
        /* Meta row */

        .meta-row {
          display: flex;
          gap: 40px;
          margin-bottom: 48px;
          padding: 24px;
          background: #f8f8f7;
          border-radius: 12px;
        }

        .meta-block { flex: 1; }

        .meta-block .label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a9a39a;
          margin-bottom: 6px;
        }

        .meta-block .value {
          font-size: 13px;
          color: #1c1a17;
          font-weight: 500;
        }

        .meta-block .sub-value {
          font-size: 12px;
          color: #706a60;
        }
     
        /* Parties */


        .parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .party { width: 46%; }
        .party .label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a9a39a;
          margin-bottom: 8px;
        }

        .party .name {
          font-size: 15px;
          font-weight: 600;
          color: #1c1a17;
          margin-bottom: 2px;
        }

        .party .detail {
          font-size: 12px;
          color: #706a60;
          line-height: 1.7;
        }


     
        /* Line items table */

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
        }


        thead tr {
          border-bottom: 1.5px solid #1c1a17;
        }

        thead th {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #706a60;
          padding: 0 0 10px 0;
          text-align: left;
        }


        thead th.num { text-align: right; }
        tbody tr {


          border-bottom: 1px solid #e2e0db;
        }


        tbody td {
          padding: 12px 0;
          font-size: 13px;
          color: #1c1a17;
        }


        td.desc { width: 50%; }
        td.num { text-align: right; color: #3d3a36; }
     
        /* Totals */

        .totals-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .totals {
          width: 260px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          color: #706a60;
        }

        .totals-row.total {
          border-top: 1.5px solid #1c1a17;
          margin-top: 8px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #1c1a17;
        }


     
        /* Notes */


        .notes-section {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #e2e0db;
        }


        .notes-section .label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a9a39a;
          margin-bottom: 8px;
        }


        .notes-section p {
          font-size: 12px;
          color: #706a60;
          line-height: 1.7;
          white-space: pre-wrap;
        }
     
        /* Footer */


        .footer {
          margin-top: 56px;
          padding-top: 16px;
          border-top: 1px solid #e2e0db;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #a9a39a;
        }
      </style>
    </head>
    <body>
     


      <div class="header">
        ${logoHTML}
        <div class="invoice-label">
          <h1>Invoice</h1>
          <div class="inv-number">${escapeHtml(invoice.invoiceNumber)}</div>
          ${invoice.status ? `<span class="status">${invoice.status.toUpperCase()}</span>` : ""}
        </div>
      </div>
     
      <div class="meta-row">
        <div class="meta-block">
          <div class="label">Issue Date</div>
          <div class="value">${formatDate(invoice.issueDate)}</div>
        </div>

        <div class="meta-block">
          <div class="label">Due Date</div>
          <div class="value">${formatDate(invoice.dueDate)}</div>
        </div>

        <div class="meta-block">
          <div class="label">Amount Due</div>
          <div class="value">${fmt(total)}</div>
        </div>

        <div class="meta-block">
          <div class="label">Currency</div>
          <div class="value">${escapeHtml(invoice.currency)}</div>
        </div>
      </div>


     
      <div class="parties">
        <div class="party">
          <div class="label">From</div>
          <div class="name">${escapeHtml(invoice.business.name)}</div>
          <div class="detail">
            ${escapeHtml(invoice.business.email)}<br/>
            ${escapeHtml(invoice.business.address)}<br/>
            ${escapeHtml(invoice.business.city)}, ${escapeHtml(invoice.business.country)}
          </div>
        </div>


        <div class="party">
          <div class="label">Bill To</div>
          <div class="name">${escapeHtml(invoice.client.name)}</div>
          <div class="detail">
            ${escapeHtml(invoice.client.email)}<br/>
            ${escapeHtml(invoice.client.address)}<br/>
            ${escapeHtml(invoice.client.city)}, ${escapeHtml(invoice.client.country)}
          </div>
        </div>
      </div>
     

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="num">Qty</th>
            <th class="num">Rate</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHTML}
        </tbody>
      </table>
     


      <div class="totals-wrap">
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${fmt(subtotal)}</span>
          </div>
          ${
            invoice.taxRate > 0
              ? `<div class="totals-row">
              <span>Tax (${invoice.taxRate}%)</span>
              <span>${fmt(taxAmount)}</span>
            </div>`
              : ""
          }
          <div class="totals-row total">
            <span>Total</span>
            <span>${fmt(total)}</span>
          </div>
        </div>
      </div>
     


      ${
        invoice.notes
          ? `<div class="notes-section">
        <div class="label">Notes</div>
        <p>${escapeHtml(invoice.notes)}</p>
      </div>`
          : ""
      }
     
      <div class="footer">
        <span>Generated by Invoiceflow</span>
        <span>${escapeHtml(invoice.business.email)}</span>
      </div>
     
    </body>
    </html>`;
    }



    // escape html  function 
    
    function escapeHtml(text : string) : string {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }


    // format date function 


    function formatDate(dateStr : string) : string {
        return new Date(dateStr).toLocaleDateString("en-IN", {
           year : "numeric",
           month : "long",
           day : "numeric",
        });
    }

    












    
    
    
    
    
    



















