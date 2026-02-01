import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navigation } from "@/components/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}));

describe("Navigation", () => {
  it("renders all nav items", () => {
    render(<Navigation />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders the app name", () => {
    render(<Navigation />);

    expect(screen.getByText("FoodiePlan")).toBeInTheDocument();
  });

  it("highlights the active link", () => {
    render(<Navigation />);

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink?.className).toContain("bg-primary/10");
  });
});
