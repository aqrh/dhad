export function formatPriceIQD(
  price: number
) {
  return `${new Intl.NumberFormat(
    "ar-IQ",
    {
      maximumFractionDigits: 0,
    }
  ).format(price)} د.ع`;
}