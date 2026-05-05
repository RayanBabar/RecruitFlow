import { AuthLayout } from "@/components/features/auth/AuthLayout";
import { SignUpForm } from "@/components/features/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
