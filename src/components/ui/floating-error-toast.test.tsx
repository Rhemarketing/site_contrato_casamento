import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FloatingErrorToast } from "./floating-error-toast";

afterEach(() => {
  cleanup();
});

describe("FloatingErrorToast", () => {
  it("renders error code and message correctly", () => {
    render(<FloatingErrorToast errorCode="RESULT_CONFIGURATION_ERROR" message="Dados incompletos" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Código de erro: RESULT_CONFIGURATION_ERROR/)).toBeInTheDocument();
    expect(screen.getByText("Dados incompletos")).toBeInTheDocument();
  });

  it("renders default message when message prop is not provided", () => {
    render(<FloatingErrorToast errorCode="DB_ERROR" />);

    expect(screen.getByText(/Houve uma inconsistência ou falta de dados/)).toBeInTheDocument();
  });

  it("can be dismissed by clicking the close button", () => {
    render(<FloatingErrorToast errorCode="ERR_01" />);

    const closeButton = screen.getByRole("button", { name: "Fechar notificação" });
    fireEvent.click(closeButton);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
