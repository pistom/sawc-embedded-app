import { IncomingOptions } from "use-http";

export default (token: string) => (
  {
    interceptors: {
      request: ({ options }) => {
        options.headers = [
          ['Authorization', `Bearer ${token}`],
          ['Content-Type', 'application/json'],
          ['Accept', 'application/json'],
        ];
        return options;
      },
    },
  } as IncomingOptions
);