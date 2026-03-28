// email service , using resend 

import {Resend} from "resend";
import type { InvoiceData } from "@/types/invoice";
import { formatCurrency, calculateTotals } from "./invoice";


const resend = new Resend(process.env.RESEND_API_KEY);


interface SendInvoiceEmailOptions {
    invoice : InvoiceData;
    pdfBuffer : Buffer;
}


export async function sendInvoiceEmail({
   invoice,pdfBuffer
} : SendInvoiceEmailOptions) {
   
   const {total} = calculateTotals(invoice.lineItems, invoice.taxRate);

   const formattedTotal = formatCurrency(total, invoice.currency);

  // resend email function 

  const {data, error} = await resend.emails.send({
      from : `${invoice.business.name} <piyushsuthar524@gmail.com>`,
      to : [invoice.client.email],
      subject : `Invoice ${invoice.invoiceNumber} from ${invoice.business.name} - ${formattedTotal} due`,
      html : buildEmailHTML(invoice, formattedTotal),

      attachments : [
         {
           filename : `invoice-${invoice.invoiceNumber}.pdf`,
           content : pdfBuffer,
         },
      ],
  });


  if(error) throw new Error(error.message);

  return data;

}


function buildEmailHTML(invoice: InvoiceData, formattedTotal: string): string {
  return `
    <div style="font-family:'DM Sans',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1c1a17;">
      <h2 style="font-size:20px;font-weight:600;margin-bottom:8px;">
        Invoice from ${invoice.business.name}
      </h2>
      <p style="color:#706a60;margin-bottom:24px;font-size:14px;">
        Hi ${invoice.client.name}, please find your invoice attached.
      </p>
      <div style="background:#f8f8f7;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#706a60;font-size:13px;">Invoice Number</span>
          <span style="font-weight:500;font-size:13px;">${invoice.invoiceNumber}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#706a60;font-size:13px;">Due Date</span>
          <span style="font-weight:500;font-size:13px;">${new Date(invoice.dueDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #e2e0db;padding-top:12px;margin-top:12px;">
          <span style="font-weight:600;font-size:15px;">Amount Due</span>
          <span style="font-weight:600;font-size:15px;color:#14532d;">${formattedTotal}</span>
        </div>
      </div>
      <p style="color:#706a60;font-size:12px;">
        The invoice PDF is attached to this email. If you have any questions, reply to this email.
      </p>
      <hr style="border:none;border-top:1px solid #e2e0db;margin:24px 0;" />
      <p style="color:#a9a39a;font-size:11px;text-align:center;">Sent via Invoicely</p>
    </div>
  `;
}




