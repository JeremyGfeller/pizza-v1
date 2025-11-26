"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CartItem, DeliveryZone, Profile } from "@/lib/types";
import { StripeCheckout } from "@/components/stripe-checkout";

interface CheckoutFormProps {
  deliveryZones: DeliveryZone[];
  user: any;
  profile: Profile | null;
  addresses: any[];
}

export function CheckoutForm({
  deliveryZones,
  user,
  profile,
  addresses,
}: CheckoutFormProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState(user?.email || profile?.email || "");
  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [canton, setCanton] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // Delivery calculations
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        router.push("/cart");
      } else {
        setCart(parsedCart);
      }
    } else {
      router.push("/cart");
    }

    const savedZone = localStorage.getItem("deliveryZone");
    if (savedZone) {
      try {
        const zoneData = JSON.parse(savedZone);
        if (zoneData.enteredPostalCode) {
          setPostalCode(zoneData.enteredPostalCode);
        }
        setCanton(zoneData.canton);
        setDeliveryZone(zoneData);
        setDeliveryFee(zoneData.delivery_fee);
      } catch (e) {
        console.error("Failed to parse saved delivery zone");
      }
    }
  }, [router]);

  useEffect(() => {
    // Auto-populate address if user selects saved address
    if (selectedAddress && addresses) {
      const address = addresses.find((a) => a.id === selectedAddress);
      if (address) {
        setStreet(address.street);
        setCity(address.city);
        setPostalCode(address.postal_codes);
        setCanton(address.canton);
      }
    }
  }, [selectedAddress, addresses]);

  useEffect(() => {
    if (postalCode && deliveryZones) {
      const zone = deliveryZones.find((z) =>
        z.postal_codess.includes(postalCode)
      );
      if (zone) {
        setDeliveryZone(zone);
        setDeliveryFee(zone.delivery_fee);
        setCanton(zone.canton);
        setError("");
      } else {
        setDeliveryZone(null);
        setDeliveryFee(0);
        setError("Désolé, nous ne livrons pas encore à ce code postal.");
      }
    }
  }, [postalCode, deliveryZones]);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const calculateTax = (subtotal: number, deliveryFee: number) => {
    return (subtotal + deliveryFee) * 0.077; // 7.7% Swiss VAT
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal, deliveryFee);
    return subtotal + deliveryFee + tax;
  };

  const handleSubmitOrder = async () => {
    // Validate form
    if (
      !email ||
      !name ||
      !phone ||
      !street ||
      !city ||
      !postalCode ||
      !canton
    ) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!deliveryZone) {
      setError("Veuillez entrer une adresse de livraison valide");
      return;
    }

    const subtotal = calculateSubtotal();
    if (subtotal < deliveryZone.min_order_amount) {
      setError(
        `Commande minimum pour cette zone: CHF ${deliveryZone.min_order_amount.toFixed(
          2
        )}`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tax = calculateTax(subtotal, deliveryFee);
      const total = calculateTotal();

      const estimatedDeliveryTime = new Date();
      estimatedDeliveryTime.setMinutes(
        estimatedDeliveryTime.getMinutes() +
          (deliveryZone.estimated_delivery_minutes || 30)
      );

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          guestEmail: !user ? email : null,
          guestName: !user ? name : null,
          guestPhone: !user ? phone : null,
          deliveryStreet: street,
          deliveryCity: city,
          deliveryPostalCode: postalCode,
          deliveryCanton: canton,
          deliveryNotes,
          subtotal,
          deliveryFee,
          tax,
          total,
          estimatedDeliveryTime: estimatedDeliveryTime.toISOString(),
          cart,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      setOrderId(data.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
      setLoading(false);
    }
  };

  // If order is created, show Stripe checkout
  if (orderId) {
    return <StripeCheckout orderId={orderId} amount={calculateTotal()} />;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Delivery information */}
      <div className="lg:col-span-2 space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={!!user}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+41 79 123 45 67"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses && addresses.length > 0 && (
              <div>
                <Label>Adresses enregistrées</Label>
                <RadioGroup
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}
                >
                  <div className="space-y-2 mt-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-2 border rounded-lg p-3"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label
                          htmlFor={address.id}
                          className="cursor-pointer flex-1"
                        >
                          {address.street}, {address.postal_codes}{" "}
                          {address.city}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="cursor-pointer">
                        Utiliser une autre adresse
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div>
              <Label htmlFor="street">Rue et numéro *</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rue de la Gare 1"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lausanne"
                />
              </div>
              <div>
                <Label htmlFor="canton">Canton *</Label>
                <Input
                  id="canton"
                  value={canton}
                  onChange={(e) => setCanton(e.target.value)}
                  placeholder="Vaud"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="deliveryNotes">
                Instructions de livraison (facultatif)
              </Label>
              <Textarea
                id="deliveryNotes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Instructions spéciales pour la livraison?"
                rows={3}
              />
            </div>
            {deliveryZone && (
              <Alert>
                <AlertDescription>
                  Temps de livraison estimé:{" "}
                  {deliveryZone.estimated_delivery_minutes || 30} minutes
                  {deliveryZone.min_order_amount > 0 && (
                    <>
                      {" "}
                      • Commande minimum: CHF{" "}
                      {deliveryZone.min_order_amount.toFixed(2)}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Résumé de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.pizzaName} ({item.sizeName})
                  </span>
                  <span>CHF {(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>CHF {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Frais de livraison
                </span>
                <span>CHF {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA (7.7%)</span>
                <span>
                  CHF{" "}
                  {calculateTax(calculateSubtotal(), deliveryFee).toFixed(2)}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>CHF {calculateTotal().toFixed(2)}</span>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmitOrder}
              disabled={loading || !deliveryZone}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continuer vers le paiement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
