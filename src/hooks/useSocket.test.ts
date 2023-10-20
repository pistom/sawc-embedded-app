import { createServer } from "http";
import { Server } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import Client from "socket.io-client";
import { useSocket } from "./useSocket";
import { renderHook } from "@testing-library/react";
import 'setimmediate';

describe("my awesome project", () => {
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
    expect(result.current).toBe(true);
    done();
  });

});