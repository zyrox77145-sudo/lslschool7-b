import {
  doc,
  getDocFromServer,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  parseFirestoreSchedule,
  sanitizeScheduleForFirestore,
} from '../constants/schedule';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WeeklySchedule } from '../types/neon';

const SCHEDULE_COLLECTION = 'classSchedules';
const CLASS_SCHEDULE_DOC_ID = 'class-7b';
const CLASS_SCHEDULE_PATH = `${SCHEDULE_COLLECTION}/${CLASS_SCHEDULE_DOC_ID}`;

let activeWriteChain: Promise<void> = Promise.resolve();

export function subscribeToClassSchedule(
  onRemoteSchedule: (schedule: WeeklySchedule) => void,
  onMissingRemoteSchedule: () => void,
  onSyncError: (err: unknown) => void,
): Unsubscribe {
  const docRef = doc(db, SCHEDULE_COLLECTION, CLASS_SCHEDULE_DOC_ID);

  const applySnapshotData = (data: Record<string, unknown> | undefined) => {
    const parsed = parseFirestoreSchedule(data);
    if (parsed) {
      onRemoteSchedule(parsed);
    }
  };

  const unsubscribeSnapshot = onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onMissingRemoteSchedule();
        return;
      }
      applySnapshotData(snapshot.data() as Record<string, unknown>);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, CLASS_SCHEDULE_PATH);
      } catch (wrappedError) {
        onSyncError(wrappedError);
      }
    },
  );

  // Force a fresh server check whenever a mobile/desktop tab wakes from background
  const handleVisibilityChange = () => {
    if (typeof document === 'undefined' || document.visibilityState !== 'visible') {
      return;
    }
    void getDocFromServer(docRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          applySnapshotData(snapshot.data() as Record<string, unknown>);
        }
      })
      .catch(() => {
        // Ignore transient offline wakeup errors; onSnapshot will resync when online
      });
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return () => {
    unsubscribeSnapshot();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}

export async function saveClassScheduleToCloud(
  schedule: WeeklySchedule,
): Promise<void> {
  const docRef = doc(db, SCHEDULE_COLLECTION, CLASS_SCHEDULE_DOC_ID);
  const sanitized = sanitizeScheduleForFirestore(schedule);

  const nextWrite = activeWriteChain.then(async () => {
    try {
      await runTransaction(db, async (transaction) => {
        const existingSnap = await transaction.get(docRef);
        if (!existingSnap.exists()) {
          transaction.set(docRef, {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          transaction.update(docRef, {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, CLASS_SCHEDULE_PATH);
    }
  });

  // Keep queue alive even if an individual write fails
  activeWriteChain = nextWrite.catch(() => undefined);
  return nextWrite;
}

export async function seedClassScheduleIfMissing(
  initialSchedule: WeeklySchedule,
): Promise<void> {
  const docRef = doc(db, SCHEDULE_COLLECTION, CLASS_SCHEDULE_DOC_ID);
  const sanitized = sanitizeScheduleForFirestore(initialSchedule);

  try {
    await runTransaction(db, async (transaction) => {
      const existingSnap = await transaction.get(docRef);
      if (!existingSnap.exists()) {
        transaction.set(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CLASS_SCHEDULE_PATH);
  }
}
