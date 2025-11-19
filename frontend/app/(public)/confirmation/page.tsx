"use client";

import Link from "next/link";
import { CheckCircle, Package, Truck } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/order.store";
import { useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const order = useOrderStore((state) => state.order);
  const router = useRouter();

  useEffect(() => {
    if (!order) {
      router.push("/");
    }
  }, [order, router]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 md:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4 pt-8">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold">Pedido Confirmado!</h1>
            <p className="text-lg text-muted-foreground">
              Obrigado pela sua compra. Seu pedido foi recebido com sucesso.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Número do Pedido
                  </p>
                  <p className="text-2xl font-bold font-mono">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="text-2xl font-bold">
                    {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">O que acontece agora?</h2>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Preparando seu Pedido</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nossa equipe está preparando seus produtos para envio.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Prazo estimado: 1-2 dias úteis
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
                      <Truck className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Em Transporte</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu pedido está a caminho. Você receberá atualizações de
                      rastreamento via email.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Prazo estimado: 5-10 dias úteis
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Entregue</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu pedido chegará com segurança no endereço fornecido.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <p className="text-sm text-blue-900">
                Um email de confirmação foi enviado para seu email de cadastro.
                Você também pode acompanhar seu pedido acessando sua conta.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link href="/">
              <Button size="lg" className="flex-1">
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
