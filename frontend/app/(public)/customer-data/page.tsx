"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useShoppingCartStore } from "@/store/cart.store";
import { useGetProductsIds } from "@/hooks/products.hook";
import { useCreateOrder } from "@/hooks/order.hook";
import Cookies from "js-cookie";
import { toast } from "sonner";
import type { CreateOrderDto } from "@/lib/types";
import { useOrderStore } from "@/store/order.store";

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

  const setOrder = useOrderStore((state) => state.setOrder);

  const { register, handleSubmit, setValue, watch, formState } =
    useForm<FormData>({
      defaultValues: {
        name: "",
        cpf: "",
        email: "",
        cep: "",
        address: "",
        number: "",
      },
    });

  const { errors } = formState;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setValue(field, value, { shouldValidate: true });
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

  const validateForm = (data: FormData): boolean => {
    if (
      !data.name.trim() ||
      data.name.trim().length < 2 ||
      !/^[a-zA-ZÀ-ÿ\s]+$/.test(data.name)
    ) {
      toast.error("Nome inválido");
      return false;
    }

    if (data.cpf.length !== 11) {
      toast.error("CPF deve conter exatamente 11 dígitos");
      return false;
    }

    if (!data.email.includes("@")) {
      toast.error("Email inválido");
      return false;
    }

    if (data.cep.length !== 8) {
      toast.error("CEP deve conter exatamente 8 dígitos");
      return false;
    }

    if (!data.address.trim() || data.address.trim().length < 5) {
      toast.error("Endereço deve ter pelo menos 5 caracteres");
      return false;
    }

    if (!data.number.trim() || data.number.trim().length > 10) {
      toast.error("Número inválido");
      return false;
    }

    return true;
  };

  const handleContinue = (data?: FormData) => {
    const payload = data || watch();
    if (!validateForm(payload)) {
      return;
    }

    createOrder(payload, {
      onSuccess: (order: any) => {
        router.push(`/payment`);
        localStorage.setItem("orderCpf", payload.cpf);
        setOrder(order);
        clearShoppingCart();
        Cookies.remove("cartId");
        localStorage.removeItem("shoppingCart");
      },
    });
  };

  const isBusy = productsLoading || isCreatingOrder;

  if (isBusy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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

  if (isError) {
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
            onSubmit={handleSubmit(handleContinue)}
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
                      {...register("name")}
                      placeholder="João Silva"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm">Nome inválido</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={watch("cpf")}
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
                    {...register("email")}
                    placeholder="joao@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">Email inválido</p>
                  )}
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
                    value={watch("cep")}
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
                      {...register("address")}
                      placeholder="Rua das Flores"
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm">Endereço inválido</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      type="text"
                      {...register("number")}
                      placeholder="123"
                      maxLength={10}
                    />
                    {errors.number && (
                      <p className="text-red-600 text-sm">Número inválido</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
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
              <Button
                type="submit"
                size="lg"
                className="flex-1 h-12 text-base font-semibold"
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? "Criando Pedido..." : "Ir para Pagamento"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
