const defaultTheme = 'system';

export function getTheme() {
  return (localStorage.getItem('theme') || defaultTheme) as 'light' | 'dark' | 'system';
}

export function getActualTheme() {
  const theme = getTheme();
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      return 'dark';
    } else {
      return 'light';
    }
  } else {
    return theme;
  }

}

export function setTheme(theme: 'light' | 'dark' | 'system') {
  localStorage.setItem('theme', theme);
  applyTheme(getActualTheme());
}

export function applyTheme(theme: 'light' | 'dark') {
  switch (theme) {
    case 'light':
      document.body.classList.toggle('dark', false);
      (document.body.style as any)['colorScheme'] = 'light';
      break;
    case 'dark':
      document.body.classList.toggle('dark', true);
      (document.body.style as any)['colorScheme'] = 'dark';
      break;
  }
}