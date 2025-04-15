export function generateOrderCode(id: number) {
  return `PED${id.toString(36).toUpperCase()}`;
}