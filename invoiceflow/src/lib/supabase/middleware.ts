// next supabase middleware part 

import {createSeverClient} from "@supabase/ssr";
import { NextRequest , NextResponse } from "next/server";



export async function middleware(request : NextRequest) {
    
     let supabaseResponse = NextResponse.next({request});

     // creating a supabase client  

     const supabase = createSeverClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

        {

           cookies : {
              getAll() {
                 return request.cookies.getAll();
              },

              setAll(cookiesToSet) {
                 cookiesToSet.forEach(({name , value}) => 
                  request.cookies.set(name , value)
                 
                 );

                 supabaseResponse = NextResponse.next({request});

                 cookiesToSet.forEach(({name , value , options}) => 
                   supabaseResponse.cookies.set(name , value , options)
                 );

              },
           }
  
        }
     );


     // getting the current user session data
      
     const {data : {user}} = await supabase.auth().getUser();


     const pathname = request.nextUrl.pathname;
     const protectedRoutes = ["/dashboard", "/invoices"];

     const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

// if user not present, redirect it to the login page 

     if(isProtected && !user) {

       const url = request.nextUrl.clone();
       url.pathname = "/login";

       url.searchParams.set("redirectTo", pathname);
       return NextResponse.redirect(url);
     }


     // if user is already logged in , redirect it to the dashboard 

     if(pathname === "/login" && user) {

       const url = request.nextUrl.clone();

       url.pathname = "/dashboard";

       return NextResponse.redirect(url);

     }

     return supabaseResponse;

};



// middleware , can run on these routes 

export const config = {

    matcher : [
       "/((?!_next/static|_next/image|favicon.ico|api/generate-pdf|api/send-email).*)",
    ],

}



