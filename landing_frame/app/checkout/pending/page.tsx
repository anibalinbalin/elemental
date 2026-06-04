import { CheckoutResult } from "../_components/checkout-result";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id } = await searchParams;
  return <CheckoutResult variant="pending" paymentId={payment_id} />;
}
