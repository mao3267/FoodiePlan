import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { CartPageContent } from "@/components/cart/cart-page-content";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <CartPageContent />;
}
