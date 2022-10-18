declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [k: string]: undefined;
      TOKEN?: string;
      GLOBAL?: string;
      DB_CONNECTION_LINK?: string;
    }
  }
}

export {};
