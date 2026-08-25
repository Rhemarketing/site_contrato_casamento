import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("limits values to the valid percentage range", () => {
    render(<ProgressBar value={140} label="Questionário" />);
    expect(screen.getByRole("progressbar", { name: "Questionário" })).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
