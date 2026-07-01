"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LinkReservaProps = {
  url: string;
};

export function LinkReserva({ url }: LinkReservaProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — user can select the input manually
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Link de reserva para clientas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Comparte este enlace por WhatsApp o redes. Tus clientas reservan sin
          necesidad de crear cuenta.
        </p>
        <div className="flex gap-2">
          <Input
            readOnly
            value={url}
            className="font-mono text-xs"
            onFocus={(e) => e.target.select()}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            aria-label="Copiar link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Abrir link">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {copied && (
          <p className="text-sm text-green-600">Link copiado al portapapeles</p>
        )}
      </CardContent>
    </Card>
  );
}
