"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authData } from "@/data/mockData";
import { User, Mail, Lock, Briefcase, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Role = "SEEKER" | "EMPLOYER";

export function SignUpForm() {
  const data = authData.signup;
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("SEEKER");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: selectedRole }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to register");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Error signing in after registration");
      } else {
        // Redirect based on role chosen at sign-up
        router.push(selectedRole === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
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
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs font-bold border-b-2 border-primary">
            {data.subtitleAction}
          </Link>
        </p>
      </div>

      <div className="bg-card py-8 px-4 border-2 border-border sm:px-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        {/* Role Selector */}
        <div className="mb-6">
          <p className="uppercase tracking-widest text-xs font-bold text-foreground mb-3">I am a</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole("SEEKER")}
              className={`flex flex-col items-center gap-2 p-4 border-2 transition-all font-bold text-sm uppercase tracking-wider ${
                selectedRole === "SEEKER"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("EMPLOYER")}
              className={`flex flex-col items-center gap-2 p-4 border-2 transition-all font-bold text-sm uppercase tracking-wider ${
                selectedRole === "EMPLOYER"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Employer</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm uppercase tracking-wider">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name" className="uppercase tracking-widest text-xs font-bold text-foreground">{data.nameLabel}</Label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder={data.namePlaceholder}
                className="pl-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors bg-background"
              />
            </div>
          </div>

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
            <Label htmlFor="password" className="uppercase tracking-widest text-xs font-bold text-foreground">{data.passwordLabel}</Label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder={data.passwordPlaceholder}
                className="pl-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors bg-background"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-2 border-border bg-background rounded-none accent-primary"
            />
            <Label htmlFor="terms" className="ml-2 block text-sm text-foreground font-medium">
              {data.termsText}{" "}
              <Link href="#" className="text-primary hover:text-primary/80 border-b border-primary">
                {data.termsLink}
              </Link>
            </Label>
          </div>

          <div>
            <Button type="submit" disabled={isLoading} className="w-full uppercase tracking-widest font-bold rounded-none text-sm border-2 border-transparent hover:border-foreground transition-all">
              {isLoading
                ? "Creating Account..."
                : `Sign Up as ${selectedRole === "EMPLOYER" ? "Employer" : "Job Seeker"}`}
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
        {data.footerText}{" "}
        <Link href="/login" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs font-bold border-b border-transparent hover:border-primary">
          {data.footerAction}
        </Link>
      </p>
    </motion.div>
  );
}
