export const isOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const allowedDays = [4, 5, 6, 0];
  const afterOpening = hours > 19 || (hours === 19 && minutes >= 30);
  const beforeClosing = hours < 24;

  return allowedDays.includes(day) && afterOpening && beforeClosing;
};