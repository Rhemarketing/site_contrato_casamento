import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

vi.mock("@/app/actions/auth.actions", () => ({
  loginAction: vi.fn(),
}));

afterEach(cleanup);

describe("LoginForm", () => {
  it("renders password input with eye toggle button (closed eye by default)", () => {
    render(<LoginForm callbackUrl="/dashboard" />);

    const passwordInput = screen.getByLabelText("Senha");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    // Initially masked: button label is 'Exibir senha' (olho fechado)
    const toggleButton = screen.getByRole("button", { name: "Exibir senha" });
    expect(toggleButton).toBeInTheDocument();

    // Clicking reveals password: type becomes 'text', button label is 'Ocultar senha' (olho aberto)
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();

    // Clicking again conceals password: type becomes 'password', button label is 'Exibir senha' (olho fechado)
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Exibir senha" })).toBeInTheDocument();
  });
});
