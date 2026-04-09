import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence, readJsonBody } from "./test-utils";

function renderJournalRoute() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app/journal"]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function sampleEntry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "journal-1",
    type: "book",
    title: "Deep Work",
    imageUrl: "https://images.example/deep-work.jpg",
    sourceUrl: "https://books.example/deep-work",
    review: "A practical reread.",
    consumedOn: "2026-04-07",
    createdAt: "2026-04-07T10:00:00.000Z",
    updatedAt: "2026-04-07T10:00:00.000Z",
    ...overrides,
  };
}

describe("JournalPage", () => {
  it("renders entries returned by the api", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          sampleEntry(),
          sampleEntry({
            id: "journal-2",
            type: "video",
            title: "Kiki's Delivery Service",
            review: "Warm and calm.",
            imageUrl: null,
            sourceUrl: "https://videos.example/kiki",
          }),
        ],
      }),
    );

    renderJournalRoute();

    expect(await screen.findByText("Deep Work")).toBeInTheDocument();
    expect(screen.getByText("Kiki's Delivery Service")).toBeInTheDocument();
    expect(screen.getByText("Warm and calm.")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open source link/i })).toHaveLength(2);
  });

  it("uploads an image before creating a journal entry", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
      async (request) => {
        expect(request.method).toBe("POST");
        expect(new URL(request.url).pathname).toBe("/api/v1/uploads/images");
        expect(request.headers.get("Content-Type")).not.toContain("application/json");
        const formData = await request.formData();
        const file = formData.get("file");
        expect(file).toBeInstanceOf(File);
        expect((file as File).name).toBe("cover.png");

        return jsonResponse(
          { imageUrl: "http://localhost:8080/uploads/images/cover-uploaded.png" },
          { status: 201 },
        );
      },
      async (request) => {
        expect(request.method).toBe("POST");
        expect(new URL(request.url).pathname).toBe("/api/v1/journal");
        expect(await request.json()).toMatchObject({
          title: "Intermezzo",
          consumedOn: "2026-04-09",
          imageUrl: "http://localhost:8080/uploads/images/cover-uploaded.png",
          sourceUrl: "https://books.example/intermezzo",
          review: "Sharp and intimate.",
          type: "book",
        });

        return jsonResponse({
          item: sampleEntry({
            title: "Intermezzo",
            imageUrl: "http://localhost:8080/uploads/images/cover-uploaded.png",
            sourceUrl: "https://books.example/intermezzo",
            review: "Sharp and intimate.",
            consumedOn: "2026-04-09",
          }),
        });
      },
      jsonResponse({
        items: [
          sampleEntry({
            title: "Intermezzo",
            imageUrl: "http://localhost:8080/uploads/images/cover-uploaded.png",
            sourceUrl: "https://books.example/intermezzo",
            review: "Sharp and intimate.",
            consumedOn: "2026-04-09",
          }),
        ],
      }),
    );
    const user = userEvent.setup();

    renderJournalRoute();
    await screen.findByRole("heading", { name: /watch and read journal/i });

    await user.type(screen.getByLabelText(/title/i), "Intermezzo");
    await user.type(screen.getByLabelText(/consumed date/i), "2026-04-09");
    await user.type(screen.getByLabelText(/source link/i), "https://books.example/intermezzo");
    await user.type(screen.getByLabelText(/review/i), "Sharp and intimate.");
    await user.upload(
      screen.getByLabelText(/poster or cover/i, { selector: "input[type='file']" }),
      new File(["cover"], "cover.png", { type: "image/png" }),
    );

    await user.click(screen.getByRole("button", { name: /save entry/i }));
  });

  it("edits and deletes an existing journal entry", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [sampleEntry()] }),
      jsonResponse({
        item: sampleEntry({
          review: "Updated review copy.",
          sourceUrl: null,
        }),
      }),
      jsonResponse({
        items: [
          sampleEntry({
            review: "Updated review copy.",
            sourceUrl: null,
          }),
        ],
      }),
      jsonResponse({ success: true }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    renderJournalRoute();
    expect(await screen.findByText("Deep Work")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    const reviewField = screen.getByLabelText(/review/i);
    await user.clear(reviewField);
    await user.type(reviewField, "Updated review copy.");
    const sourceField = screen.getByLabelText(/source link/i);
    await user.clear(sourceField);

    await user.click(screen.getByRole("button", { name: /update entry/i }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find((call) => {
        const init = call[1] as RequestInit | undefined;
        return init?.method === "PATCH";
      });
      expect(patchCall).toBeDefined();
    });

    const patchCall = fetchMock.mock.calls.find((call) => {
      const init = call[1] as RequestInit | undefined;
      return init?.method === "PATCH";
    });
    expect(readJsonBody(patchCall?.[1] as RequestInit)).toMatchObject({
      title: "Deep Work",
      sourceUrl: null,
      review: "Updated review copy.",
      type: "book",
    });
    expect(await screen.findByText("Updated review copy.")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls.find((call) => {
        const init = call[1] as RequestInit | undefined;
        return init?.method === "DELETE";
      });
      expect(deleteCall).toBeDefined();
    });

    expect(confirmSpy).toHaveBeenCalledWith('Delete "Deep Work" from your journal?');
    expect(await screen.findByText(/no journal entries yet/i)).toBeInTheDocument();
  });
});
