import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database , InvoiceStatus } from "@/types/supabase";



interface RouteContext {
  params: Promise<{ id: string }>;
}

function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;



  // Auth check with normal client


  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }




  const { status  } = await request.json();



  const validStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
  if (!validStatuses.includes(status as InvoiceStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // First verify ownership using normal client (RLS enforced)
  const { data: owned } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", id)
    .single();


  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Use service client for the update to avoid never type error


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getServiceClient() as any;
  const { error } = await db
    .from("invoices")
    .update({ status })
    .eq("id", id);



  if (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }



  return NextResponse.json({ success: true });
}