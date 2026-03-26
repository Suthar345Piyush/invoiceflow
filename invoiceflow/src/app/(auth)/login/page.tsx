'use client';


import { useState , useEffect } from "react";
import { useRouter , useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {Mail, Lock, User, ArrowLeft} from "lucide-react";


type Mode = "login" | "signup";

export default function LoginPage() {
   
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    const [mode, setMode] = useState<Mode>((searchParams.get("mode") as Mode) || "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);


    const supabase = createClient();


    const handleSubmit = async (e : React.SubmitEvent) => {
         e.preventDefault();
         setLoading(true);
         setError("");


         try {

            if(mode === "signup") {
               const {error} = await supabase.auth.signUp({
                 email, password, options : {data : {full_name : name}},
               });

               if(error) throw error;

               setSent(true);

            } else {

               const {error} = await supabase.auth.signInWithPassword({
                email, password,
               });

               if(error) throw error;
               router.push(redirectTo);
               router.refresh();
            }
         } catch(err : unknown) {

           setError(err instanceof Error ? err.message : "Authentication failed");
           
         }  finally {
            setLoading(false);
         }
    };

  

     const handleGoogle = async () => {
       await supabase.auth.signInWithOAuth({
        provider : "google",
        options : {
           redirectTo : `${window.location.origin}/auth/callback?next=${redirectTo}`,
        }
       });
     }



     return (
        
       <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">

              <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-6 transition-colors">
                <ArrowLeft size={14}/>
                Back to invoice builder
              </Link>

              <div className="bg-white rounded-2xl  border border-ink-100 shadow-sm overflow-hidden animate-fade-up">

                <div className="h-1 bg-linear-to-r from brand-400 via-brand-600 to-brand-800" /> 

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-6">

                    <div className="w-8 h-8 bg-ink-950 rounded-lg flex items-center justify-center">
                      <span className="font-semibold text-ink-900">I</span>
                    </div>

                    <span className="font-semibold text-ink-900">Invoiceflow</span>

                  </div>

                  {
                    sent ? (
                       
                    ) : (
                       
                    )
                  }


               





                </div>




                </div>

      





        </div>

       </div>


     )













}