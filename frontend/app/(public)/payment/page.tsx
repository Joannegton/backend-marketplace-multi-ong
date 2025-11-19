import PaymentClient from "./PaymentClient";

export default async function PaymentPage({
  searchParams,
}: Readonly<{
  searchParams:
    | { [key: string]: string | string[] | undefined }
    | Promise<{
        [key: string]: string | string[] | undefined;
      }>;
}>) {
  const sp = (await searchParams) || {};

  const orderId = Array.isArray(sp?.orderId) ? sp.orderId[0] : sp?.orderId;
  const cpf = Array.isArray(sp?.cpf)
    ? sp.cpf[0]
    : (sp?.cpf as string | undefined);

  return <PaymentClient orderId={orderId || ""} cpf={cpf} />;
}
