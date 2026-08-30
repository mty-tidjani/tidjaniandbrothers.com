"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/validation/newsletter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = async (data: NewsletterInput) => {
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="text-primary">Merci, vous êtes inscrit&nbsp;!</p>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 sm:flex-row"
      noValidate
    >
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Adresse email
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="Votre email"
          {...register("email")}
        />
        {errors.email ? (
          <p role="alert" className="text-error mt-1 text-sm">
            {errors.email.message}
          </p>
        ) : null}
        {status === "error" ? (
          <p role="alert" className="text-error mt-1 text-sm">
            Une erreur est survenue, réessayez.
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        S&rsquo;abonner
      </Button>
    </form>
  );
}
