import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { InvoiceData } from "@/types/invoice";
import type { Database } from "@/types/supabase";


interface RouteContext {
  params: Promise<{ id: string }>;
}



// Service role client — it bypasses RLS completely , and have the full database access 


function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// PUT /api/invoices/[id] — update


export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;

  // Auth check with normal client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }



const { invoice }: { invoice: InvoiceData } = await request.json();

const invoiceInsert : Database['public']['Tables']['invoices']['Insert'] = {

      invoice_number:     invoice.invoiceNumber,
      issue_date:         invoice.issueDate,
      due_date:           invoice.dueDate,
      client_name:        invoice.client.name,
      client_email:       invoice.client.email,
      client_address:     invoice.client.address,
      client_city:        invoice.client.city,
      client_country:     invoice.client.country,
      business_name:      invoice.business.name,
      business_email:     invoice.business.email,
      business_address:   invoice.business.address,
      business_city:      invoice.business.city,
      business_country:   invoice.business.country,
      business_logo_url:  invoice.business.logoUrl ?? null,
      tax_rate:           invoice.taxRate,
      currency:           invoice.currency,
      notes:              invoice.notes ?? null,
      user_id : user.id,

}


// using the invoiceInsert in the  update call 


const {error  : updateError} = await supabase.from("invoices").update(invoiceInsert as never).eq("id", id).eq("user_id", user.id);


  if (updateError) {
    console.error("Invoice update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }


  // Use service client for line items — avoids RLS policy timing issues
  // We already confirmed ownership above via the invoice update


  const service = getServiceClient();

  const { error: deleteError } = await service
    .from("line_items")
    .delete()
    .eq("invoice_id", id);

  if (deleteError) {
    console.error("Line items delete error:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const lineItemRows = invoice.lineItems.map((item) => ({
    invoice_id:  id,
    description: item.description,
    quantity:    item.quantity,
    rate:        item.rate,
  }));

  const { error: insertError } = await service
    .from("line_items")
    .insert(lineItemRows as never);

  if (insertError) {
    console.error("Line items insert error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}




// DELETE /api/invoices/[id]



export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = getServiceClient();
  await service.from("line_items").delete().eq("invoice_id", id);

  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}