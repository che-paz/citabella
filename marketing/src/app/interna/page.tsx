import { redirect } from "next/navigation";
import {
  getInternalPassword,
  isInternalAuthenticated,
} from "@/lib/internal-auth";
import { LoginForm } from "./LoginForm";

export default function InternaPage() {
  if (isInternalAuthenticated()) {
    redirect("/interna/leads");
  }

  const configured = Boolean(getInternalPassword());

  return (
    <div className="mx-auto max-w-sm pt-16">
      <h1 className="font-display text-2xl font-bold">Gota+Check · Interna</h1>
      <p className="mt-2 text-sm text-[#6f5f5a]">
        Panel de leads y alta asistida. Uso exclusivo del estudio.
      </p>
      {!configured ? (
        <p className="mt-6 rounded-lg border border-rose-soft/60 bg-white p-4 text-sm text-rose-deep">
          Configurá <code className="text-xs">INTERNAL_TOOLS_PASSWORD</code> (≥8
          caracteres) en el proyecto marketing de Vercel.
        </p>
      ) : (
        <div className="mt-6">
          <LoginForm />
        </div>
      )}
    </div>
  );
}
