"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  createEvent,
  createInitialDatabase,
  deleteEvent,
  deleteMeetingNote,
  deleteScheduleItem,
  deleteTask,
  saveFeeCalculation,
  updateEvent,
  upsertHypothesis,
  upsertMeetingNote,
  upsertParticipant,
  upsertScheduleItem,
  upsertTask,
} from "@/lib/repository";
import {
  createEventInSupabase,
  deleteEventInSupabase,
  fetchDatabaseFromSupabase,
  saveParticipantInSupabase,
  updateEventInSupabase,
} from "@/lib/supabase-repository";
import { hasSupabaseConfig } from "@/lib/supabase";
import type { Event, FeeCalculationDraft, MeetingNote, MockDatabase, Participant, ScheduleItem, Task } from "@/types";

interface AppDataContextValue {
  db: MockDatabase;
  setDb: React.Dispatch<React.SetStateAction<MockDatabase>>;
  createEventItem: (input: Omit<Event, "id">) => Promise<void>;
  updateEventItem: (input: Event) => Promise<void>;
  deleteEventItem: (id: string) => Promise<void>;
  saveHypothesisItem: (input: { id?: string; eventId: string; title: string; description: string; successCriteria: string; actualResult: string; success: boolean; improvementNotes: string }) => void;
  saveParticipantItem: (input: Participant) => Promise<void>;
  saveScheduleItem: (input: ScheduleItem) => void;
  deleteScheduleItemById: (id: string) => void;
  saveTaskItem: (input: Task) => void;
  deleteTaskItem: (id: string) => void;
  saveMeetingNoteItem: (input: MeetingNote) => void;
  deleteMeetingNoteItem: (id: string) => void;
  saveFeeCalculationItem: (input: FeeCalculationDraft) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<MockDatabase>(() => createInitialDatabase());
  const remoteEnabled = hasSupabaseConfig();

  useEffect(() => {
    if (!remoteEnabled) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const nextDb = await fetchDatabaseFromSupabase();
        if (!cancelled) {
          setDb(nextDb);
        }
      } catch (error) {
        console.error("Failed to load Supabase data", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [remoteEnabled]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      db,
      setDb,
      createEventItem: async (input) => {
        if (!remoteEnabled) {
          setDb((current) => createEvent(current, input));
          return;
        }

        await createEventInSupabase(input);
        setDb(await fetchDatabaseFromSupabase());
      },
      updateEventItem: async (input) => {
        if (!remoteEnabled) {
          setDb((current) => updateEvent(current, input));
          return;
        }

        await updateEventInSupabase(input);
        setDb(await fetchDatabaseFromSupabase());
      },
      deleteEventItem: async (id) => {
        if (!remoteEnabled) {
          setDb((current) => deleteEvent(current, id));
          return;
        }

        await deleteEventInSupabase(id);
        setDb(await fetchDatabaseFromSupabase());
      },
      saveHypothesisItem: (input) => setDb((current) => upsertHypothesis(current, input)),
      saveParticipantItem: async (input) => {
        if (!remoteEnabled) {
          setDb((current) => upsertParticipant(current, input));
          return;
        }

        await saveParticipantInSupabase(input);
        setDb(await fetchDatabaseFromSupabase());
      },
      saveScheduleItem: (input) => setDb((current) => upsertScheduleItem(current, input)),
      deleteScheduleItemById: (id) => setDb((current) => deleteScheduleItem(current, id)),
      saveTaskItem: (input) => setDb((current) => upsertTask(current, input)),
      deleteTaskItem: (id) => setDb((current) => deleteTask(current, id)),
      saveMeetingNoteItem: (input) => setDb((current) => upsertMeetingNote(current, input)),
      deleteMeetingNoteItem: (id) => setDb((current) => deleteMeetingNote(current, id)),
      saveFeeCalculationItem: (input) => setDb((current) => saveFeeCalculation(current, input)),
    }),
    [db, remoteEnabled],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return value;
}
