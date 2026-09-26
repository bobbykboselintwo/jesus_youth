// Unique Device Identifier Helper for No-Login User Status Tracking

const DEVICE_ID_KEY = 'jy_device_id_v1';

export function getDeviceId() {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (e) {
    return 'dev_fallback_' + Date.now().toString(36);
  }
}

export function getDeviceMeta() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
