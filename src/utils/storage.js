// LocalStorage utility for auto-saving form drafts

const STORAGE_KEY = 'jy_student_registration_draft_v1';

export function saveDraft(data, currentStep) {
  try {
    const payload = {
      data,
      step: currentStep,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save draft to localStorage:', err);
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.warn('Failed to load draft from localStorage:', err);
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear draft from localStorage:', err);
  }
}
