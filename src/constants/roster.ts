export interface RosterStudent {
  firstName: string;
  lastName: string | null;
}

export interface AuthenticatedStudent {
  firstName: string;
  lastName: string;
  isCreator: boolean;
}

export const CREATOR_KEY = 'created by asrorbek and abdulvoris 7-b lsl students';

export function verifyCreatorKey(input: string): boolean {
  return input.trim().toLowerCase() === CREATOR_KEY;
}

export const CLASS_7B_ROSTER: RosterStudent[] = [
  { firstName: 'Abdulvoris', lastName: 'Abduraximov' },
  { firstName: 'Asrorbek', lastName: 'Toxtasinov' },
  { firstName: 'Asadbek', lastName: "O'ljaboyev" },
  { firstName: 'Gulzira', lastName: 'Muhammadqodirova' },
  { firstName: 'Mohira', lastName: 'Valiyeva' },
  { firstName: 'Abdulboqiy', lastName: 'Abdulazizov' },
  { firstName: 'Iqbolmirzo', lastName: 'Azimjonov' },
  { firstName: 'Muhammadzoxid', lastName: 'Rustamxonov' },
  { firstName: 'Muhammad', lastName: 'Komiljanov' },
  { firstName: 'Dilnavoz', lastName: 'Mahkamova' },
  { firstName: 'Robiya', lastName: 'Nurmuhammedova' },
  { firstName: 'Muhammadibroxim', lastName: 'Abduraxmanov' },
  { firstName: 'Islomtoy', lastName: 'Mahmudjonov' },
  { firstName: 'Islombek', lastName: 'Abdullajanov' },
  { firstName: 'Manzura', lastName: 'Xolmatjanovna' },
  { firstName: 'Mukarram', lastName: null },
  { firstName: 'Mutaxxir', lastName: 'Jamaliddinov' },
  { firstName: 'Muhammadrizo', lastName: null },
];

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’`ʻʼ‘]/g, '');
}

export function matchClassStudent(
  firstInput: string,
  lastInput: string,
): { firstName: string; lastName: string } | null {
  const normFirst = normalizeName(firstInput);
  const normLast = normalizeName(lastInput);

  if (!normFirst) return null;

  for (const member of CLASS_7B_ROSTER) {
    if (normalizeName(member.firstName) !== normFirst) {
      continue;
    }

    if (member.lastName === null) {
      return {
        firstName: member.firstName,
        lastName: lastInput.trim(),
      };
    }

    if (normalizeName(member.lastName) === normLast) {
      return {
        firstName: member.firstName,
        lastName: member.lastName,
      };
    }
  }

  return null;
}

export const SAVED_STUDENT_STORAGE_KEY = 'lsl_school_7b_saved_student_v2';

export function loadSavedStudent(): AuthenticatedStudent | null {
  try {
    const raw = localStorage.getItem(SAVED_STUDENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthenticatedStudent>;
    if (
      typeof parsed?.firstName !== 'string' ||
      typeof parsed?.isCreator !== 'boolean'
    ) {
      return null;
    }
    const matched = matchClassStudent(parsed.firstName, parsed.lastName ?? '');
    if (!matched) return null;
    return {
      ...matched,
      isCreator: parsed.isCreator,
    };
  } catch {
    return null;
  }
}

export function persistSavedStudent(student: AuthenticatedStudent): void {
  try {
    localStorage.setItem(SAVED_STUDENT_STORAGE_KEY, JSON.stringify(student));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function clearSavedStudent(): void {
  try {
    localStorage.removeItem(SAVED_STUDENT_STORAGE_KEY);
  } catch {
    // Ignore storage errors gracefully
  }
}
