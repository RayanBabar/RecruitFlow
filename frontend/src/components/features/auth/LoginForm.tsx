"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authData } from "@/data/mockData";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const data = authData.login;
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Fetch the session to get the user's role and redirect accordingly
        const session = await getSession();
        const role = (session?.user as any)?.role;

        if (role === "EMPLOYER") {
          router.push("/employer/dashboard");
        } else {
          router.push("/seeker/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground uppercase tracking-wider">{data.title}</h2>
        <p className="mt-2 text-muted-foreground font-medium">
          {data.subtitle}{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs font-bold border-b-2 border-primary">
            {data.subtitleAction}
          </Link>
        </p>
      </div>

      <div className="bg-card py-8 px-4 border-2 border-border sm:px-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        {error && (
          <div className="mb-4 p-3 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm uppercase tracking-wider">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="uppercase tracking-widest text-xs font-bold text-foreground">{data.emailLabel}</Label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={data.emailPlaceholder}
                className="pl-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors bg-background"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="uppercase tracking-widest text-xs font-bold text-foreground">{data.passwordLabel}</Label>
              <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest border-b border-transparent hover:border-primary">
                {data.forgotPasswordText}
              </Link>
            </div>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={data.passwordPlaceholder}
                className="pl-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors bg-background"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-2 border-border bg-background rounded-none accent-primary"
            />
            <Label htmlFor="remember-me" className="ml-2 block text-sm text-foreground font-medium">
              {data.rememberMeText}
            </Label>
          </div>

          <div>
            <Button type="submit" disabled={isLoading} className="w-full uppercase tracking-widest font-bold rounded-none text-sm border-2 border-transparent hover:border-foreground transition-all">
              {isLoading ? "Signing in..." : data.submitText}
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
        {data.footerText}{" "}
        <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs font-bold border-b border-transparent hover:border-primary">
          {data.footerAction}
        </Link>
      </p>
    </motion.div>
  );
}
