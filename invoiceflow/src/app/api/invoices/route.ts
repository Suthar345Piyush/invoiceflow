// invoices crud api route 

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceData } from "@/types/invoice";
import { Database } from "@/types/supabase";




// POST  /api/invoices - create invoices 

export async function POST(request : Request) {
    const supabase = await createClient();

    const {data : {user}} = await supabase.auth.getUser();


    if(!user){
      return NextResponse.json({error : "unauthorized"} , {status : 401});
    }


    const {invoice} : {invoice : InvoiceData} = await request.json();


    const invoiceInsert : Database["public"]["Tables"]["invoices"]["Insert"] = {
       user_id : user.id,
       invoice_number : invoice.invoiceNumber,
       status : invoice.status,
       issue_date : invoice.issueDate,
       due_date : invoice.dueDate,
       client_name : invoice.client.name,
       client_email : invoice.client.email,
       client_address : invoice.client.address,
       client_city : invoice.client.city,
       client_country : invoice.client.country,
       business_name : invoice.business.name,
       business_email : invoice.business.email,
       business_address : invoice.business.address,
       business_city : invoice.business.city,
       business_country : invoice.business.country,
       business_logo_url : invoice.business.logoUrl ?? null,
       tax_rate : invoice.taxRate,
       currency : invoice.currency,
       notes : invoice.notes ?? null,
    };


    const  {data : invoiceRow , error : invoiceError} = await supabase.from("invoices").insert(invoiceInsert as never).select().single();


    if(invoiceError || !invoiceRow) {
       return NextResponse.json({error : invoiceError?.message} , {status : 500});
    }



    // insert line items  

    const lineItemRows = invoice.lineItems.map((item) => ({
      invoice_id:  item.id,
      description: item.description,
      quantity:    item.quantity,
      rate:        item.rate,
    }));


    const {error : itemsError} = await supabase.from("line_items").insert(lineItemRows as never);

    if(itemsError) {
       return NextResponse.json({error : itemsError.message} , {status : 500});
    }

  return NextResponse.json({id : invoice.id} , {status : 201});
}






// get request 

// GET /api/invoices - listing user's invoices 

export async function GET() {

     const supabase = await createClient();

     const {data : {user}} = await supabase.auth.getUser();

     if(!user) {
       return NextResponse.json({error : "Unauthorized"}, {status : 401});
     }

     const {data, error} = await supabase.from("invoices").select("*, line_items(*)").eq("user_id", user.id).order("created_at", {ascending : false});


     if(error) {
       return NextResponse.json({error : error.message}, {status : 500});
     }

     return NextResponse.json({invoices : data});

     
}




