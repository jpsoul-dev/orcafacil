export function triggerHaptic(type: 'success' | 'error' | 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'success':
          navigator.vibrate([40, 30, 40])
          break
        case 'error':
          navigator.vibrate([100, 50, 100])
          break
        case 'light':
          navigator.vibrate(15)
          break
        case 'medium':
          navigator.vibrate(30)
          break
        case 'heavy':
          navigator.vibrate(60)
          break
      }
    } catch (e) {
      // Ignora falhas de permissão de vibração em navegadores específicos
    }
  }
}
