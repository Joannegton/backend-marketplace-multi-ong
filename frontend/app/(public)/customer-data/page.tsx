"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useShoppingCartStore } from "@/store/cart.store";
import { useGetProductsIds } from "@/hooks/products.hook";
import { useCreateOrder } from "@/hooks/order.hook";
import Cookies from "js-cookie";
import { toast } from "sonner";
import type { CreateOrderDto } from "@/lib/types";

interface FormData extends CreateOrderDto {}

export default function CustomerDataPage() {
  const router = useRouter();
  const { shoppingCart, clearShoppingCart } = useShoppingCartStore();
  const {
    data: products,
    isLoading: productsLoading,
    isError,
  } = useGetProductsIds(
    shoppingCart?.items.map((item) => item.productId) || []
  );

  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    cpf: "",
    email: "",
    cep: "",
    address: "",
    number: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replaceAll(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned;
    }
    return cleaned.slice(0, 11);
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replaceAll(/\D/g, "");
    if (cleaned.length <= 8) {
      return cleaned;
    }
    return cleaned.slice(0, 8);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return false;
    }

    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.name)) {
      toast.error("Nome deve conter apenas letras");
      return false;
    }

    if (formData.cpf.length !== 11) {
      toast.error("CPF deve conter exatamente 11 dígitos");
      return false;
    }

    if (!formData.email.includes("@")) {
      toast.error("Email inválido");
      return false;
    }

    if (formData.cep.length !== 8) {
      toast.error("CEP deve conter exatamente 8 dígitos");
      return false;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      toast.error("Endereço deve ter pelo menos 5 caracteres");
      return false;
    }

    if (!formData.number.trim() || formData.number.trim().length > 10) {
      toast.error("Número inválido");
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    createOrder(formData, {
      onSuccess: (order: any) => {
        localStorage.setItem("orderCpf", formData.cpf);
        router.push(
          `/payment?orderId=${encodeURIComponent(order.id)}&cpf=${encodeURIComponent(
            formData.cpf
          )}`
        );
        clearShoppingCart();
        Cookies.remove("cartId");
        localStorage.removeItem("shoppingCart");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao criar pedido");
      },
    });
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            Erro ao carregar produtos
          </p>
          <Button size="lg" onClick={() => router.push("/")}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  if (!shoppingCart?.items || shoppingCart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            Seu carrinho está vazio
          </p>
          <Button size="lg" onClick={() => router.push("/")}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = shoppingCart.items.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 md:px-8 py-8">
        <Button
          type="button"
          variant="ghost"
          className="mb-6 -ml-4 hover:bg-muted"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Dados do Cliente
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={(e) =>
                        handleInputChange("cpf", formatCPF(e.target.value))
                      }
                      placeholder="00000000000"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="joao@example.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    type="text"
                    value={formData.cep}
                    onChange={(e) =>
                      handleInputChange("cep", formatCEP(e.target.value))
                    }
                    placeholder="00000000"
                    maxLength={8}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Rua *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Rua das Flores"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      type="text"
                      value={formData.number}
                      onChange={(e) =>
                        handleInputChange("number", e.target.value)
                      }
                      placeholder="123"
                      maxLength={10}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1 h-12 text-base font-semibold"
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? "Criando Pedido..." : "Ir para Pagamento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                onClick={() => router.push("/cart")}
                disabled={isCreatingOrder}
              >
                Voltar
              </Button>
            </div>
          </form>

          <div>
            <Card className="sticky top-20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {shoppingCart.items.map((item) => (
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
                      Subtotal ({shoppingCart.items.length}{" "}
                      {shoppingCart.items.length === 1 ? "item" : "itens"})
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
