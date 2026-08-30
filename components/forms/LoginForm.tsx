"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/admin");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="gap-stack-md flex flex-col"
      noValidate
    >
      <div>
        <label htmlFor="email" className="sr-only">
          Adresse email
        </label>
        <div className="relative">
          <Mail
            className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="email"
            type="email"
            placeholder="Adresse email"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <p role="alert" className="text-error mt-1 text-sm">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Mot de passe
        </label>
        <div className="relative">
          <Lock
            className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="password"
            type="password"
            placeholder="Mot de passe"
            className="pl-10"
            {...register("password")}
          />
        </div>
        {errors.password ? (
          <p role="alert" className="text-error mt-1 text-sm">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <a
          href="/admin/forgot-password"
          className="text-on-surface-variant hover:text-primary text-sm hover:underline"
        >
          Mot de passe oublié ?
        </a>
      </div>

      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
