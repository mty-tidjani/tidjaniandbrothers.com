"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSchema,
  type ContactFormInput,
} from "@/lib/validation/lead";
import { CONTACT_SERVICES } from "@/lib/constants";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormInput) => {
    setState("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact" }),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      reset();
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <h3 className="text-headline-sm text-on-surface mb-2">
          Message envoyé&nbsp;!
        </h3>
        <p className="text-on-surface-variant">
          Merci, nous revenons vers vous sous 24h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass-card glow-hover space-y-stack-md rounded-xl p-6 md:p-8"
      noValidate
    >
      <h2 className="text-headline-md text-on-surface mb-2">
        Envoyer un message
      </h2>

      <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
        <FormField
          label="Nom complet"
          htmlFor="fullName"
          error={errors.fullName?.message}
        >
          <Input
            id="fullName"
            placeholder="Votre nom"
            {...register("fullName")}
          />
        </FormField>
        <FormField
          label="Entreprise"
          htmlFor="company"
          error={errors.company?.message}
        >
          <Input
            id="company"
            placeholder="Votre entreprise"
            {...register("company")}
          />
        </FormField>
      </div>

      <div className="gap-stack-md grid grid-cols-1 md:grid-cols-2">
        <FormField
          label="Téléphone"
          htmlFor="phone"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            placeholder="+237 6XX XXX XXX"
            {...register("phone")}
          />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="email@exemple.com"
            {...register("email")}
          />
        </FormField>
      </div>

      <FormField
        label="Service souhaité"
        htmlFor="service"
        error={errors.service?.message}
      >
        <Select id="service" defaultValue="" {...register("service")}>
          <option value="" disabled>
            Sélectionnez un service
          </option>
          {CONTACT_SERVICES.map((service) => (
            <option key={service.value} value={service.value}>
              {service.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Message"
        htmlFor="message"
        error={errors.message?.message}
      >
        <Textarea
          id="message"
          rows={4}
          placeholder="Décrivez vos besoins..."
          {...register("message")}
        />
      </FormField>

      {state === "error" ? (
        <p role="alert" className="text-error text-sm">
          Une erreur est survenue, réessayez dans un instant.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "Envoi..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
