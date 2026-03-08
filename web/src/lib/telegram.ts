export const getTelegramInitData = (): string | null => {
  // Check if Telegram WebApp object is available
  // The Telegram script needs to be included in index.html
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const webApp = (window as any).Telegram.WebApp;
    // Tell Telegram that the app is ready
    webApp.ready();
    // Expand the app to maximum height
    webApp.expand();
    
    return webApp.initData;
  }
  return null;
};

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp.initDataUnsafe?.user || null;
  }
  return null;
};
