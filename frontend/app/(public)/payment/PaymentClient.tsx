"use client";

import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useOrderByIdAndCpf, useCheckoutPayment } from "@/hooks/order.hook";
import { toast } from "sonner";

export default function PaymentClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [cpf, setCpf] = useState<string>("");

  useEffect(() => {
    const storedCpf =
      (typeof globalThis !== "undefined" && (globalThis as any).localStorage
        ? (globalThis as any).localStorage.getItem("orderCpf")
        : "") || "";
    setCpf(storedCpf);
  }, []);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useOrderByIdAndCpf(orderId || "", cpf);

  const { mutate: checkoutPayment, isPending: isProcessingPayment } =
    useCheckoutPayment();

  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            Pedido não encontrado. Por favor, volte e tente novamente.
          </p>
          <Button size="lg" onClick={() => router.push("/customer-data")}>
            Voltar aos Dados do Cliente
          </Button>
        </div>
      </div>
    );
  }

  const handleProcessPayment = () => {
    checkoutPayment(
      {
        orderId: orderId,
        dto: {
          paymentProvider: paymentMethod,
          paymentToken: undefined,
          reference: undefined,
        },
      },
      {
        onSuccess: (order) => {
          toast.success("Pagamento processado com sucesso!");
          router.push(`/confirmation?orderId=${orderId}`);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Erro ao processar pagamento");
        },
      }
    );
  };

  if (isOrderLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (isOrderError || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            Erro ao carregar pedido
          </p>
          <Button size="lg" onClick={() => router.push("/customer-data")}>
            Voltar aos Dados do Cliente
          </Button>
        </div>
      </div>
    );
  }

  if (!order.items || order.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">Pedido sem itens</p>
          <Button size="lg" onClick={() => router.push("/customer-data")}>
            Voltar aos Dados do Cliente
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0
  );
  const shipping = 10;
  const total = order.total;

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 md:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Método de Pagamento
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-5 w-5" />
                  Escolha o Método de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <fieldset className="space-y-3">
                  <legend className="sr-only">Método de Pagamento</legend>
                  {["credit_card", "pix", "boleto"].map((method) => {
                    const getMethodLabel = (m: string) => {
                      if (m === "credit_card") return "Cartão de crédito";
                      if (m === "pix") return "Transferência PIX";
                      return "Boleto bancário";
                    };

                    return (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        htmlFor={`payment-${method}`}
                      >
                        {getMethodLabel(method)}
                        <input
                          id={`payment-${method}`}
                          type="radio"
                          name="payment-method"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                      </label>
                    );
                  })}
                </fieldset>

                <Button
                  type="button"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment
                    ? "Processando Pagamento..."
                    : "Confirmar e Pagar"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {order.items.map((item: any) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm pb-2 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity} × R${" "}
                          {item.priceSnapshot.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-right ml-2">
                        R$ {(item.priceSnapshot * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "itens"})
                    </span>
                    <span className="font-semibold">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-semibold">
                      {shipping > 0 ? `R$ ${shipping.toFixed(2)}` : "Grátis"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
