import { getServerSideUser } from "@/lib/payload-utils";
import Image from "next/image";
import { cookies } from "next/headers";
import { getPayloadClient } from "../../get-payload";
import { notFound, redirect } from "next/navigation";
import { Product, ProductFile } from "@/payload-types";
import { PRODUCT_CATEGORIES } from "@/config";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import PaymentStatus from "@/components/PaymentStatus";
import { User } from "payload/dist/auth";

interface PageProps {
   searchParams: {
      [key: string]: string | string[] | undefined;
   };
}

const ThankYouPage = async ({ searchParams }: PageProps) => {
   const orderId = searchParams.orderId;
   const nextCookies = cookies();

   const { user } = await getServerSideUser(nextCookies);

   const payload = await getPayloadClient();

   const { docs: orders } = await payload.find({
      collection: "orders",
      depth: 2,
      where: {
         id: {
            equals: orderId,
         },
      },
   });

   const [order] = orders;

   if (!order) return notFound();

   const idOfUserWhoOrdered =
      typeof order.user === "string" ? order.user : (order?.user as User)?.id;

   if (idOfUserWhoOrdered !== user?.id) {
      return redirect(`/sign-in?origin=thank-you?orderId=${order.id}`);
   }

   const orderTotal: number = (order.products as Product[]).reduce((total, product) => {
      return total + product.price;
   }, 0);

   return (
      <main className="relative lg:min-h-full">
         <div className="hidden md:block h-80 overflow-hidden lg:absolute lg:h0full lg:w-1/2 lg:pr-4 xl:pr-12">
            <Image
               fill
               alt="Thank you"
               src="/checkout-thank-you.png"
               className="h-full w-full object-cover object-center"
            />
         </div>

         <div>
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
               <div className="lg:col-start-2">
                  <p
                     className="
               text-sm text-red-800 font-bold
               "
                  >
                     Order successfull
                  </p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                     Thank you for shopping
                  </h1>

                  {order._isPaid ? (
                     <p className="mt-2 text-base text-muted-foreground">
                        Your order was successful, you can down your assets from below.
                        You&apos;re receipt and order details are sent to{" "}
                        {typeof order.user !== "string" ? (
                           <span className="font-medium">
                              {(order?.user as User).email}
                           </span>
                        ) : null}
                     </p>
                  ) : (
                     <p className="mt-2 text-base text-muted-foreground">
                        We&apos;re still processing your order, we will confirm it soon!
                     </p>
                  )}

                  <div className="mt-16 text-sm font-medium">
                     <div className="text-muted-foreground">Order number.</div>
                     <div className="mt-2 text-gray-900">{order.id}</div>

                     <ul className="mt-6 divide-y divide-gray-200 border-gray-200 text-sm font-medium">
                        {(order.products as Product[]).map((product) => {
                           const label = PRODUCT_CATEGORIES.find(
                              ({ value }) => value === product.category
                           )?.label;

                           const downloadUrl = (product.product_files as ProductFile)
                              .url as string;

                           const { image } = product.images[0];

                           return (
                              <li key={product.id} className="flex space-x-6 py-6">
                                 <div className="relative h-24 w-24">
                                    {typeof image !== "string" && image.url ? (
                                       <Image
                                          fill
                                          src={image.url}
                                          alt={`${product.name} image`}
                                          className="flex-none rounded-md bg-gay-100 object-cover object-center"
                                       />
                                    ) : null}
                                 </div>

                                 <div className="flex-auto flex flex-col justify-between">
                                    <div className="space-y-1">
                                       <h3 className="text-gray-900">{product.name}</h3>

                                       <p className="my-1">Category: {label}</p>
                                    </div>

                                    {order._isPaid ? (
                                       <a
                                          href={downloadUrl}
                                          download={product.name}
                                          className="text-red-700 hover:underline underline-offset-2"
                                       >
                                          Download asset
                                       </a>
                                    ) : null}
                                 </div>

                                 <p className="flex-none font-medium">
                                    {formatPrice(product.price)}
                                 </p>
                              </li>
                           );
                        })}
                     </ul>

                     <div className="space-y-6 border-t border-gray-200 pt-6 text-muted-foreground">
                        <div className="flex justify-between">
                           <p>Subtotal</p>
                           <p>{formatPrice(orderTotal)}</p>
                        </div>

                        <div className="flex justify-between">
                           <p>Transaction fee</p>
                           <p>{formatPrice(1)}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200">
                           <p className="text-base">Total</p>
                           <p className="text-base">{formatPrice(orderTotal + 1)}</p>
                        </div>
                     </div>

                     <PaymentStatus
                        isPaid={order?._isPaid as boolean}
                        orderEmail={(order?.user as User).email}
                        orderId={order?.id as string}
                     />

                     <div className="mt-16 border-t border-gray-200 py-6 text-right">
                        <Link
                           href="/products"
                           className="text-sm font-medium text-red-600"
                        >
                           Continue shopping
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
};

export default ThankYouPage;
