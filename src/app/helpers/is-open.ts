export const isOpenRestaurant = () => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const allowedDays = [4, 5, 6, 0];
  const afterOpening = hours > 19 || (hours === 19 && minutes >= 30);
  const beforeClosing = hours < 24;

  return allowedDays.includes(day) && afterOpening && beforeClosing;
};

export const isOpenRestaurantMerged = () => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const allowedDays = [4, 5, 6, 0]; // Quinta, Sexta, Sábado, Domingo
  const afterOpening = hours > 19 || (hours === 19 && minutes >= 30);
  const beforeClosing = hours < 24;

  const open = allowedDays.includes(day) && afterOpening && beforeClosing;
  return open;
};

export const getNextOpening = (): string => {
  const now = new Date();
  const allowedDays = [4, 5, 6, 0]; // Quinta, Sexta, Sábado, Domingo

  for (let i = 1; i <= 7; i++) {
    const future = new Date(now);
    future.setDate(now.getDate() + i);
    const day = future.getDay();

    if (allowedDays.includes(day)) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
      };
      future.setHours(19, 30); // abre 19:30
      return future.toLocaleString("pt-BR", options);
    }
  }

  return "em breve"; // fallback de segurança
};
