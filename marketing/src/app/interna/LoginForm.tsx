"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginInternaAction } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-xl bg-[#a85a5a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(loginInternaAction, null);

  return (
    <form action={action} className="rounded-xl border border-[#e0d4d0] bg-white p-5">
      <label className="block text-sm font-medium">
        Contraseña
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-lg border border-[#e0d4d0] px-3 py-2 text-base outline-none focus:border-[#a85a5a]"
        />
      </label>
      {state?.error ? (
        <p className="mt-3 text-sm text-rose-deep">{state.error}</p>
      ) : null}
      <Submit />
    </form>
  );
}
