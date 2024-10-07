"use client";

import { trpc } from "@/trpc/client";
import { Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

interface VerifyEmailProps {
   token: string;
}

const VerifyEmail = ({ token }: VerifyEmailProps) => {
   //    const { data, isLoading, isError, error } = trpc.auth.verifyEmail.useQuery({
   //       token,
   //    });

   const { data, isLoading, isError, error } = trpc.auth.verifyEmail.useQuery({
      token,
   });

   if (error) {
      console.error(error.message);
   }

   if (isError) {
      return (
         <div className="flex flex-col items-center gap-2">
            <XCircle className="h8 w-8 text-red-600" />
            <h3 className="font-semibold text-xl ">There was a problem</h3>
            <p className="text-muted-foreground text-center">
               There was a problem verifying your email. Please try again.
            </p>
         </div>
      );
   }

   if (data?.success) {
      return (
         <div className="flex h-full flex-col items-center justify-center">
            <div className="relative mb-4 h-60 w-60 text-muted-foreground">
               <Image src="/email-sent.png" fill alt="email sent" />
            </div>

            <h3 className="font-semibold text-2xl ">Email verified!</h3>
            <Link href="/sign-in" className={buttonVariants({ className: "mt-4" })}>
               Sign in
            </Link>
         </div>
      );
   }

   if (isLoading) {
      return (
         <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin h8 w-8 text-red-300" />
            <h3 className="font-semibold text-xl ">Please wait, verifying..</h3>
            <p className="text-muted-foreground text-center">Wont take long :D </p>
         </div>
      );
   }
};

export default VerifyEmail;
