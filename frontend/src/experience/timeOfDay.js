export function getMood() {
  const h = new Date().getHours()
  if (h >= 5 && h < 9)
    return { bg: '#0a0712', stars: '#ffcdb8', label: 'dawn' }
  if (h >= 9 && h < 17)
    return { bg: '#02040c', stars: '#ffffff', label: 'day' }
  if (h >= 17 && h < 22)
    return { bg: '#070409', stars: '#ffd9a1', label: 'dusk' }
  return { bg: '#000004', stars: '#bcd0ff', label: 'night' }
}
