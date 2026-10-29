import AuthForm from "@/components/AuthForm";
import { signup } from "@/app/auth/actions";

export const metadata = { title: "Registrieren · Finanz-Manager" };

export default function SignupPage() {
  return (
    <AuthForm
      title="Konto erstellen"
      submitLabel="Registrieren"
      action={signup}
      switchText="Schon registriert?"
      switchHref="/login"
      switchLabel="Zum Login"
    />
  );
}
