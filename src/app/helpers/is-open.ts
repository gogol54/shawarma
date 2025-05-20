interface OpeningHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export const fetchIsRestaurantOpen = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/opening-hours', { cache: 'no-store' });
    const data: OpeningHour[] = await response.json();
    console.log(data)
    if (!Array.isArray(data)) return false;

    const nowUtc = new Date();

    const saoPauloOffsetMinutes = -3 * 60; // -180

    // Hora UTC em minutos
    const utcMinutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();

    // Ajusta para horário de SP
    let saoPauloMinutes = utcMinutes + saoPauloOffsetMinutes;

    // Ajusta caso seja negativo ou ultrapasse 24h (1440 minutos)
    if (saoPauloMinutes < 0) {
      saoPauloMinutes += 1440;
    } else if (saoPauloMinutes >= 1440) {
      saoPauloMinutes -= 1440;
    }

    // Hora e minuto em SP
    const saoPauloHour = Math.floor(saoPauloMinutes / 60);
    const saoPauloMinute = saoPauloMinutes % 60;

    // Data em UTC + offset SP para pegar o dia da semana correto
    const saoPauloDate = new Date(nowUtc.getTime() + saoPauloOffsetMinutes * 60 * 1000);
    const day = saoPauloDate.getUTCDay();

    const currentMinutes = saoPauloHour * 60 + saoPauloMinute;

    const today = data.find((item: OpeningHour) => item.dayOfWeek === day);

    if (!today || !today.isOpen || !today.openTime || !today.closeTime) {
      return false;
    }

    const [openHour, openMinute] = today.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = today.closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } catch (error) {
    console.error('Erro ao verificar horário de funcionamento', error);
    return false;
  }
};
