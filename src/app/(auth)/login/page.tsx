import AuthForm from "@/components/AuthForm";
import { login } from "@/app/auth/actions";

export const metadata = { title: "Anmelden · Finanz-Manager" };

export default function LoginPage() {
  return (
    <AuthForm
      title="Anmelden"
      submitLabel="Anmelden"
      action={login}
      switchText="Noch kein Konto?"
      switchHref="/registrieren"
      switchLabel="Jetzt registrieren"
    />
  );
}
