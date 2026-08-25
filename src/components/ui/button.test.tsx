import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible button with its label", () => {
    render(<Button>Continuar</Button>);
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });
  it("supports the disabled state", () => {
    render(<Button disabled>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });
});
