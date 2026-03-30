// child client component of the page.tsx 


'use client';


import { useState , useEffect } from "react";
import { useRouter , useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {Mail, Lock, User, ArrowLeft} from "lucide-react";


type Mode = "login" | "signup";

export default function LoginForm() {
   
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

                       <div className="text-center py-4">
                         <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">

                          <Mail size={24} className="text-brand-700"/>

                          </div>

                          <h2 className="text-xl font-semibold text-ink-900 mb-2">Check your email</h2>

                          <p className="text-sm text-ink-500">We sent a confirmation link to{" "}
                           <span className="font-medium text-ink-800">{email}</span>
                          
                          </p>

                          <button onClick={() => {
                            setSent(false); 
                            setMode("login");
                            }} className="mt-4 text-sm text-ink-600 hover:text-ink-900 font-medium hover:underline">
                              Back to sign in
                          </button>

                        </div>

                    ) : (

                       <>

                       <h2 className="text-xl font-semibold text-ink-900 mb-1">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>

                       <p className="text-sm text-ink-500 mb-6">{mode === "signup" ? "Save and manage all your invoices in one place" : "Sign in to access your invoices"}</p>

                       <button
                        onClick={handleGoogle}
                        className="cursor-pointer w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-ink-200 hover:border-ink-300 hover:bg-ink-50 transition-all text-sm font-medium text-ink-700 mb-5"
                       >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-ink-100"/>
                  <span className="text-xs text-ink-400">or</span>
                  <div className="flex-1 h-px bg-ink-100"/>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                     <div className="relative">

                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>

                      <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ink-200 hover:border-ink-300 focus:border-transparent focus:ring-2 foucs:ring-brand-500 outline-none transition-all"/>


                     </div>
                  )}

                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>

                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ink-200 hover:border-ink-300 focus:border-transparent focus:ring-2 foucs:ring-brand-500 outline-none transition-all"/>

                  </div>


                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>

                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ink-200 hover:border-ink-300 focus:border-transparent focus:ring-2 foucs:ring-brand-500 outline-none transition-all"/>

                  </div>


                  {
                     error && (
                       <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                     )
                  }


                  <Button className="w-full" loading={loading} type="submit" size="lg">
                    {mode === "signup" ? "Create account" : "Sign in"}
                  </Button>

                </form>



                <p className="text-center text-sm text-ink-500 mt-5">{mode === "signup" ? "Already have an account? " : "No account yet? "}

                <button onClick={() => {setMode(mode === "signup" ? "login" : "signup"); setError("");}} className="text-ink-900 font-medium hover:underline">

                  {mode === "signup" ? "Sign in" : "Sign up free"}

                </button>
                
                
                </p>

              </>
                       
            )
        }

  </div>

</div>

</div>

</div>

)
}