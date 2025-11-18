import PaymentClient from "./PaymentClient";

export default function PaymentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const orderId = Array.isArray(searchParams?.orderId)
    ? searchParams.orderId[0]
    : searchParams?.orderId;
  return <PaymentClient orderId={orderId || ""} />;
}
