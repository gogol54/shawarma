export const isOpenRestaurant = () => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const allowedDays = [4, 5, 6, 0];
  const afterOpening = hours > 19 || (hours === 19 && minutes >= 45);
  const beforeClosing = hours < 23;

  return allowedDays.includes(day) && afterOpening && beforeClosing;
};

export const isOpenRestaurantMerged = () => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const allowedDays = [4, 5, 6, 0]; // Quinta, Sexta, Sábado, Domingo
  const afterOpening = hours > 19 || (hours === 19 && minutes >= 45);
  const beforeClosing = hours < 23;

  const open = allowedDays.includes(day) && afterOpening && beforeClosing;
  return open;
};

