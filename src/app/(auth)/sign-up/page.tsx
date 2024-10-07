"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   AuthCredentialsValidator,
   TAuthCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";

const Page = () => {
   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<TAuthCredentialsValidator>({
      resolver: zodResolver(AuthCredentialsValidator),
   });

   const router = useRouter();

   const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
      onError: (error) => {
         if (error.data?.code === "CONFLICT") {
            toast.error("Email already exists, try to sign in instead");

            return;
         }

         if (error instanceof ZodError) {
            toast.error(error.issues[0].message);

            return;
         }

         toast.error("An error occurred, please try again");
      },
      onSuccess: ({ sentToEmail }) => {
         toast.success(`We've sent an verification email to ${sentToEmail}`);
         router.push("/verify-email?to=" + sentToEmail);
      },
   });

   const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
      mutate({ email, password });
   };

   return (
      <>
         <div className="continer relative flex pt-20 flex-col items-center justify-center lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
               <div className="flex flex-col  items-center space-y-2 text-center">
                  <Icons.logo className="h-20 w-20" />
                  <h1 className="text-2xl font-bold">Create a new account</h1>

                  <Link
                     href="sign-in"
                     className={buttonVariants({
                        variant: "link",
                     })}
                  >
                     Login if you already have an account{" "}
                     <ArrowDownRight className="h-5 w-5" />
                  </Link>
               </div>

               <div className="grid gap-6 ">
                  <form onSubmit={handleSubmit(onSubmit)}>
                     <div className="grid gap-2">
                        <div className="grid gap-1 py-2">
                           <Label htmlFor="email">Email</Label>
                           <Input
                              className={cn({
                                 "focus-visible:ring-red-500": errors.email,
                              })}
                              type="email"
                              placeholder="Your email"
                              {...register("email")}
                           />
                        </div>

                        <div className="grid gap-1 py-2">
                           <Label htmlFor="password">Password</Label>
                           <Input
                              className={cn({
                                 "focus-visible:ring-red-500": errors.password,
                              })}
                              placeholder="******"
                              type="password"
                              {...register("password")}
                           />
                        </div>

                        <Button>Sign up</Button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </>
   );
};

export default Page;
