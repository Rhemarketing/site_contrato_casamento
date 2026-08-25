import { signOut } from "@/auth";

export function LogoutButton() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
      <button type="submit" className="rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5">Sair</button>
    </form>
  );
}
