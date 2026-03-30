//this is the server component , to avoid the prerendering issues 

import { Suspense } from "react";
import LoginForm from "./LoginForm";


export default function LoginPage(){
     return (
         <Suspense fallback={
          <div className="min-h-screen bg-ink-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-800 rounded-full animate-spin" />
        </div>
         }>
          <LoginForm />

         </Suspense>
     )
}