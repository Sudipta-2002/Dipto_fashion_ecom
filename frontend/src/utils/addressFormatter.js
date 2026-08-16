export const formatFullAddress = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;

  const street = (addr.address || '').trim();
  const landmark = addr.landmark && addr.landmark.trim() ? `, ${addr.landmark.trim()}` : '';
  const city = addr.city && addr.city.trim() ? `, ${addr.city.trim()}` : '';
  const state = addr.state && addr.state.trim() ? `, ${addr.state.trim()}` : '';
  const pincode = addr.pincode ? ` - ${addr.pincode}` : '';

  return `${street}${landmark}${city}${state}${pincode}`;
};
