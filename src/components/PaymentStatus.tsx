"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentStatusProps {
   orderEmail: string;
   orderId: string;
   isPaid: boolean;
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
   const { data } = trpc.payment.pollOrderStatus.useQuery(
      { orderId },
      {
         enabled: isPaid === false,
         refetchInterval: (data) => (data?.isPaid ? false : 1000), // make a req to api endpoint every 1 sec
      }
   );

   const router = useRouter();

   useEffect(() => {
      if (data?.isPaid) router.refresh();
   }, [router, data]);

   return (
      <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gay-600">
         <div>
            <p className="font-medium text-gray-900">Shipping To</p>
            <p>{orderEmail}</p>
         </div>

         <div>
            <p className="font-medium text-gray-900">Order status</p>
            <p>{isPaid ? "Payment successful" : "Payment pending"}</p>
         </div>
      </div>
   );
};

export default PaymentStatus;
