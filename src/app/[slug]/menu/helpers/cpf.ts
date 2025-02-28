export const removePoints = (cpf: string) => {
  return cpf.replace(/[\.\-]/g, "");
}

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // Verifica tamanho e repetição

  const calcCheckDigit = (factor: number) => {
    let total = 0;
    for (let i = 0; i < factor - 1; i++) {
      total += parseInt(cpf[i]) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const digit1 = calcCheckDigit(10);
  const digit2 = calcCheckDigit(11);

  return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
};