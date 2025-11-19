"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth.hook";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";
import { Logo } from "@/components/atoms/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { isAuthenticated, loading } = useAuthStore();

  const { register, handleSubmit, formState } = useForm<{
    email: string;
    password: string;
  }>({
    defaultValues: { email: "", password: "" },
  });

  const { errors } = formState;

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: { email: string; password: string }) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <Logo size="lg" />
              <h1 className="mt-6 text-3xl font-bold text-balance">
                Área administrativa
              </h1>
              <p className="mt-2 text-muted-foreground text-pretty">
                Entre com suas credenciais para acessar o dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push("/")}>
                Home
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Acesse sua conta de administrador
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@email.com"
                    disabled={loading}
                    {...register("email", { required: "Email é obrigatório" })}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    disabled={loading}
                    {...register("password", {
                      required: "Senha é obrigatória",
                    })}
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:block relative bg-muted">
        <Image
          src="/login-image.png"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-background/20" />
        <div className="absolute bottom-0 right-0 left-0 p-12">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Gerenciar produtos nunca foi tão fácil. Plataforma intuitiva e
              eficiente para o sua ONG.
            </p>
            <footer className="text-sm text-muted-foreground">
              — Equipe Marketplace Multi-Ong
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
