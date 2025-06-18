// Currency utility for client-side price conversion
const currencyRates = {
    PKR: 1,
    GBP: 0.0045,
    EUR: 0.0051,
    USD: 0.0036
};
const currencySymbols = {
    PKR: '₨',
    GBP: '£',
    EUR: '€',
    USD: '$'
};
function getCurrency() {
    return localStorage.getItem('currency')?.split('-')[1] || 'PKR';
}
function convertFromPKR(amount, currency) {
    return amount * (currencyRates[currency] || 1);
}
function formatPrice(amount, currency) {
    const symbol = currencySymbols[currency] || '';
    let value = convertFromPKR(amount, currency);
    value = currency === 'PKR' ? value.toLocaleString('en-PK', {maximumFractionDigits:2}) : value.toLocaleString(undefined, {maximumFractionDigits:2});
    return `${symbol}${value} ${currency}`;
}
window.currencyUtils = { getCurrency, convertFromPKR, formatPrice }; 