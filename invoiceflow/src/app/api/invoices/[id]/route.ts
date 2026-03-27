// invoices / id route - put and delete method 

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceData } from "@/types/invoice";

interface RouteContext {
   params : Promise<{id : string}>;
}

// PUT  - to update 

export async function PUT(request : Request, {params} : RouteContext) {
     
    const {id} = await params;
    const supabase = await createClient();

    const {data : {user}} = await supabase.auth.getUser();

    if(!user) {
        return NextResponse.json({error : "Unauthorized"}, {status : 401});
    }


    const {invoice} : {invoice : InvoiceData} = await request.json();

    // updating invoice rows (rls ensures user own these)

    const {error : updateError} = await supabase.from("invoices").update({
         invoice_number : invoice.invoiceNumber,
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
         business_logo_url : invoice.business.logoUrl,
         tax_rate : invoice.taxRate,
         currency : invoice.currency,
         notes : invoice.notes || null,
         updated_at : new Date().toISOString(),
    }).eq("id" , id);


    if(updateError) {
       return NextResponse.json({error : updateError.message} , {status : 500});
    }


    // replace line items - delete old items and inserting new ones 
    
    await supabase.from("line_items").delete().eq("invoice_id", id);

    const lineItemRows = invoice.lineItems.map((item) => ({
         invoice_id : id,
         description : item.description,
         quantity : item.quantity,
         rate : item.rate,
    }));


    const {error : itemsError} = await supabase.from("line_items").insert(lineItemRows);

    if(itemsError) {
         return NextResponse.json({error : itemsError.message} , {status : 500});
    }

    return NextResponse.json({id});   
}




// delete /api/invoices/[id]


export async function DELETE(_request : Request , {params} : RouteContext) {
        const {id} = await params;

        const supabase = await createClient();

        const {data : {user}} = await supabase.auth.getUser();

        if(!user) {
             return NextResponse.json({error : "Unauthorized"}, {status : 401});
        }


        await supabase.from("line_items").delete().eq("invoice_id", id);

    const {error}  = await supabase.from("invoices").delete().eq("id", id);

    if(error) {
         return NextResponse.json({error : error.message} , {status : 500});
    }

    return NextResponse.json({success : true});

}

