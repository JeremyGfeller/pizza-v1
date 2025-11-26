"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

export function PostalCodeChecker() {
  const router = useRouter();
  const [postalCode, setPostalCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!postalCode.trim()) {
      setError("Veuillez entrer un code postal");
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(
        `/api/zones/check?postal_codes=${postalCode}`
      );
      const data = await response.json();

      if (data.available && data.zone) {
        localStorage.setItem(
          "deliveryZone",
          JSON.stringify({
            ...data.zone,
            enteredPostalCode: postalCode,
          })
        );

        // Redirect to menu with postal code
        router.push(`/menu?postal_codes=${postalCode}`);
      } else {
        setError(
          data.message || "Livraison non disponible pour ce code postal"
        );
      }
    } catch (err) {
      setError("Erreur lors de la vérification du code postal");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Entrez votre code postal (ex: 1000)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={isChecking}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Commander maintenant"
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </form>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Entrez votre code postal pour vérifier la disponibilité de livraison et
        voir les frais applicables
      </p>
    </div>
  );
}
