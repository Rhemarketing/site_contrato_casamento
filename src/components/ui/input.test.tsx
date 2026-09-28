import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./input";

afterEach(cleanup);

describe("Input component", () => {
  it("renders label, placeholder and hint", () => {
    render(<Input id="test-email" label="E-mail" placeholder="email@exemplo.com" hint="Digite seu email" />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email@exemplo.com")).toBeInTheDocument();
    expect(screen.getByText("Digite seu email")).toBeInTheDocument();
  });

  it("renders error message and sets aria-invalid", () => {
    render(<Input id="test-field" label="Campo" error="Campo obrigatório" />);
    const input = screen.getByLabelText("Campo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("does not render password toggle button for non-password type", () => {
    render(<Input id="test-text" label="Nome" type="text" />);
    expect(screen.queryByRole("button", { name: /senha/i })).not.toBeInTheDocument();
  });

  it("renders closed eye toggle button for password type and toggles visibility on click", () => {
    render(<Input id="test-password" label="Senha" type="password" />);
    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("type", "password");

    // Initially password is hidden, icon/label is 'Exibir senha' (olho fechado)
    const toggleButton = screen.getByRole("button", { name: "Exibir senha" });
    expect(toggleButton).toBeInTheDocument();

    // Click to make password visible
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();

    // Click again to hide password
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Exibir senha" })).toBeInTheDocument();
  });

  it("respects showPasswordToggle={false} even for type='password'", () => {
    render(<Input id="test-password-no-toggle" label="Senha" type="password" showPasswordToggle={false} />);
    expect(screen.queryByRole("button", { name: /senha/i })).not.toBeInTheDocument();
  });
});
