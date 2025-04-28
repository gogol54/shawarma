
declare module 'pagarme' {
  interface PagarmeClient {
    client: {
      connect: (config: { api_key: string }) => Promise<void>; 
      disconnect: () => Promise<void>;
      // Se o client tiver outros métodos ou propriedades, adicione aqui
    };
    someFunction: (param: string) => void;
    anotherFunction: (param: number) => string;
  }

  const pagarme: PagarmeClient;
  export = pagarme;
}
