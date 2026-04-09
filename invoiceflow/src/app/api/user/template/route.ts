// getting user's current template and saving template selection 

 // GET - to take user's current template 
 // POST - save the template choice from user 


import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {createClient as createServiceClient} from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";



function getServiceClient() {
   return createServiceClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
   );
}


// GET - to get the user's current invoice template 

export async function GET() {

    const supabase = await createClient();

    const {data :{user}} = await supabase.auth.getUser();

    if(!user) return NextResponse.json({template : "classic"});

    const {data} = await supabase.from("profiles").select("selected_template").eq("id", user.id).single();


    return NextResponse.json({template : data?.selected_template  ?? "classic"});

}


// if user choose another template, then save it 

export async function POST(request : Request) {
   
   const supabase = await createClient();

   const {data : {user}} = await supabase.auth.getUser();

   if(!user) return NextResponse.json({error : "Unauthorized"}, {status : 401});


   const {template} = await request.json();


   if(!["classic", "modern", "minimal"].includes(template)) {
      return NextResponse.json({error : "Invalid template"}, {status : 400});
   }


   const service = getServiceClient();

   await service.from("profiles").upsert({id : user.id, selected_template : template, updated_at: new Date().toISOString() }, {onConflict : "id"});


   return NextResponse.json({success : true, template});
   
}










