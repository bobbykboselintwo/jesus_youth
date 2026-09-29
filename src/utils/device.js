// Unique Device Identifier Helper for No-Login User Status Tracking



export function getDeviceId() {
  return 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

export function getDeviceMeta() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
