import { signOut } from "@/auth";

interface LogoutButtonProps {
  className?: string;
  buttonText?: string;
}

export function LogoutButton({ className, buttonText = "Sair" }: LogoutButtonProps = {}) {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="w-full md:w-auto">
      <button
        type="submit"
        className={className ?? "rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5"}
      >
        {buttonText}
      </button>
    </form>
  );
}
