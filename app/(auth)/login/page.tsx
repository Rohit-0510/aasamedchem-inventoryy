"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">AASA MedChem</CardTitle>
            <p className="text-gray-500 text-sm">
              Pharmaceutical Inventory Management
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aasa.com"
                disabled={isLoading}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-gray-600 mb-3">Demo Credentials:</p>

                <div className="space-y-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="font-medium">Admin Account</p>
                    <p>Email: admin@aasa.com</p>
                    <p>Password: admin123</p>
                  </div>

                  <div className="bg-green-50 p-2 rounded">
                    <p className="font-medium">Seller Account</p>
                    <p>Email: seller@aasa.com</p>
                    <p>Password: seller123</p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-white text-center text-sm mt-6">
          Version 1.0 • Inventory Management System
        </p>
      </div>
    </div>
  );
}
