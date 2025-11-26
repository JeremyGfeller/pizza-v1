"use client";

import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { Pizza } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">PizzaShop Suisse</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Sign in to your account to continue
          </p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
