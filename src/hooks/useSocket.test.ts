import { createServer } from "http";
import { Server } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import Client from "socket.io-client";
import { useSocket } from "./useSocket";
import { renderHook, waitFor } from "@testing-library/react";
import 'setimmediate';

describe("useSocket", () => {
  let io: Server;
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const address = httpServer.address();
      const port = typeof address === "string" ? '' : address?.port;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clientSocket = new (Client as any)(`http://localhost:${port}`) as ClientSocket;
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test("socket is connected", (done) => {
    const { result } = renderHook(() => useSocket(clientSocket));
    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toBe(null);
    done();
  });

  test("socket is disconnected", (done) => {
    clientSocket.disconnect();
    const { result } = renderHook(() => useSocket(clientSocket));
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(null);
    done();
  });

  test.only("socket emits error on welcome_message", async () => {
    const { result } = renderHook(() => useSocket(clientSocket));
    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toBe(null);
    const errorMessage = "Test error message";

    io.emit("welcome_message", { status: "error", message: errorMessage });

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
      expect(result.current[1]?.toString()).toBe((new Error(errorMessage)).toString());
    });

  });
});