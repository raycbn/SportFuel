import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { HandoffConsumer } from "./HandoffConsumer";

const mocks = vi.hoisted(() => ({
  consumeHandoffFromUrl: vi.fn(),
  auth: {
    firebaseReady: true as boolean,
    handoffLogin: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useFuelAuth: () => mocks.auth,
}));

vi.mock("@/lib/handoff", () => ({
  consumeHandoffFromUrl: mocks.consumeHandoffFromUrl,
}));

describe("HandoffConsumer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.firebaseReady = true;
    mocks.auth.handoffLogin.mockResolvedValue(undefined);
    mocks.auth.logout.mockResolvedValue(undefined);
    mocks.consumeHandoffFromUrl.mockReturnValue("one-time-custom-token");
  });

  afterEach(() => cleanup());

  it("consumes the token and completes the shared Firebase sign-in", async () => {
    render(<HandoffConsumer />);

    await waitFor(() => {
      expect(mocks.consumeHandoffFromUrl).toHaveBeenCalledOnce();
      expect(mocks.auth.handoffLogin).toHaveBeenCalledWith("one-time-custom-token");
    });
    expect(mocks.auth.logout).not.toHaveBeenCalled();
  });

  it("removes a handoff token even when Firebase is not configured", () => {
    mocks.auth.firebaseReady = false;

    render(<HandoffConsumer />);

    expect(mocks.consumeHandoffFromUrl).toHaveBeenCalledOnce();
    expect(mocks.auth.handoffLogin).not.toHaveBeenCalled();
    expect(mocks.auth.logout).not.toHaveBeenCalled();
  });

  it("signs out a previous Fuel account when the shared handoff fails", async () => {
    mocks.auth.handoffLogin.mockRejectedValue(new Error("invalid custom token"));

    render(<HandoffConsumer />);

    await waitFor(() => {
      expect(mocks.auth.logout).toHaveBeenCalledOnce();
    });
  });
});
