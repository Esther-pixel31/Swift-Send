// src/utils/maskCardNumber.js
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length !== 16) return '';
  return `${cardNumber.slice(0, 4)} •••• •••• ${cardNumber.slice(-4)}`;
};
