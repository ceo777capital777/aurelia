export function formatAED(value: number) {
  return `AED ${Math.round(value).toLocaleString("en-US")}`;
}

export function formatArea(value: number) {
  return `${value.toLocaleString("en-US")} m²`;
}
