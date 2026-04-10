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

    const service = getServiceClient();

    // explicitly casting the query result to avoid type 'never' error  

    // getting data directly from profiles about the selected template by users 
   
     const {data} = await service.from("profiles").select("selected_template").eq("id", user.id).single();


     const profile = data as {selected_template : string} | null;

     // retruning the response using this profile of the data with the selected template 

     //returning selected template otherwise, returning the classic template 

     return NextResponse.json({template : profile?.selected_template ?? "classic"});
}


// if user select another template, then we will select it and save it, for entire his download system and email id   


export async function POST(request : Request) {
   
   const supabase = await createClient();

   const {data : {user}} = await supabase.auth.getUser();

   if(!user) return NextResponse.json({error : "Unauthorized"}, {status : 401});


   const {template} = await request.json();


   if(!["classic", "modern", "minimal"].includes(template)) {
      return NextResponse.json({error : "Invalid template"}, {status : 400});
   }


   const service = getServiceClient();

   await service.from("profiles").upsert({id : user.id, selected_template : template} as never, {onConflict : "id"});

   return NextResponse.json({success : true, template});
   
}










