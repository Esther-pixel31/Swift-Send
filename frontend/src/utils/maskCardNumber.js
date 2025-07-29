export const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 8) return '';
  const first = cardNumber.slice(0, 4);
  const last = cardNumber.slice(-4);
  return `${first} •••• •••• ${last}`;
};
