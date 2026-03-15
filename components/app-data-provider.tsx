"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

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
import type { Event, FeeCalculationDraft, MeetingNote, MockDatabase, Participant, ScheduleItem, Task } from "@/types";

interface AppDataContextValue {
  db: MockDatabase;
  setDb: React.Dispatch<React.SetStateAction<MockDatabase>>;
  createEventItem: (input: Omit<Event, "id">) => void;
  updateEventItem: (input: Event) => void;
  deleteEventItem: (id: string) => void;
  saveHypothesisItem: (input: { id?: string; eventId: string; title: string; description: string; successCriteria: string; actualResult: string; success: boolean; improvementNotes: string }) => void;
  saveParticipantItem: (input: Participant) => void;
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

  const value = useMemo<AppDataContextValue>(
    () => ({
      db,
      setDb,
      createEventItem: (input) => setDb((current) => createEvent(current, input)),
      updateEventItem: (input) => setDb((current) => updateEvent(current, input)),
      deleteEventItem: (id) => setDb((current) => deleteEvent(current, id)),
      saveHypothesisItem: (input) => setDb((current) => upsertHypothesis(current, input)),
      saveParticipantItem: (input) => setDb((current) => upsertParticipant(current, input)),
      saveScheduleItem: (input) => setDb((current) => upsertScheduleItem(current, input)),
      deleteScheduleItemById: (id) => setDb((current) => deleteScheduleItem(current, id)),
      saveTaskItem: (input) => setDb((current) => upsertTask(current, input)),
      deleteTaskItem: (id) => setDb((current) => deleteTask(current, id)),
      saveMeetingNoteItem: (input) => setDb((current) => upsertMeetingNote(current, input)),
      deleteMeetingNoteItem: (id) => setDb((current) => deleteMeetingNote(current, id)),
      saveFeeCalculationItem: (input) => setDb((current) => saveFeeCalculation(current, input)),
    }),
    [db],
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

