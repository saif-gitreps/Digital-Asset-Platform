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
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
   const searchParams = useSearchParams();
   const router = useRouter();

   const isSeller: boolean = searchParams.get("as") === "seller";
   const origin = searchParams.get("origin"); // redirect from example: cart page to sign-in

   const continueAsSeller = () => {
      router.push("?as=seller");
   };

   const continueAsCustomer = () => {
      router.replace("/sign-in", undefined);
   };

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<TAuthCredentialsValidator>({
      resolver: zodResolver(AuthCredentialsValidator),
   });

   const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
      onSuccess: () => {
         toast.success("Signed in successfully");

         router.refresh(); // for navbar to update accordingly

         if (origin) {
            router.push(`/${origin}`); // Send user to the original page on which they where asked to sign in
            return;
         }

         if (isSeller) {
            router.push("/sell");
            return;
         }

         router.push("/");
      },
      onError: (error) => {
         if (error.data?.code === "UNAUTHORIZED") {
            toast.error("Invalid email or password");
         }
      },
   });

   const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
      signIn({ email, password });
   };

   return (
      <>
         <div className="continer relative flex pt-20 flex-col items-center justify-center lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
               <div className="flex flex-col  items-center space-y-0 text-center">
                  <Icons.logo className="h-20 w-20" />
                  <h1 className="text-2xl font-bold">
                     Sign in to your {isSeller ? "Seller" : ""} account
                  </h1>

                  <h2 className="text-sm font-medium">Or</h2>

                  <Link
                     href="/sign-up"
                     className={buttonVariants({
                        variant: "link",
                     })}
                  >
                     Create a new account <ArrowDownRight className="h-5 w-5" />
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

                           {errors?.email && (
                              <p className="text-sm text-red-500">
                                 {errors.email.message}
                              </p>
                           )}
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
                           {errors?.password && (
                              <p className="text-sm text-red-500">
                                 {errors.password.message}
                              </p>
                           )}
                        </div>

                        <Button>Sign in</Button>
                     </div>
                  </form>

                  <div className="relative">
                     <div aria-hidden className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                     </div>

                     <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                           Or
                        </span>
                     </div>
                  </div>

                  {isSeller ? (
                     <Button
                        onClick={continueAsCustomer}
                        variant="secondary"
                        disabled={isLoading}
                     >
                        Continue as customer
                     </Button>
                  ) : (
                     <Button
                        onClick={continueAsSeller}
                        variant="secondary"
                        disabled={isLoading}
                     >
                        Continue as seller
                     </Button>
                  )}
               </div>
            </div>
         </div>
      </>
   );
};

export default Page;
