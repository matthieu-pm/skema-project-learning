import { createContext, useContext, useState } from "react";
import { initialAnswers, type Answers } from "../onboarding";
import {
  initialLessons,
  initialSessions,
  initialProfile,
  type Lesson,
  type Session,
  type Route,
} from "./model";
export function useWorkspaceState(a?: Answers) {
  const [lessons, setLessons] = useState(initialLessons),
    [sessions, setSessions] = useState(() =>
      initialSessions().map((s) =>
        s.status === "Completed"
          ? {
              ...s,
              lessonSnapshot: structuredClone(
                lessons.find((l) => l.id === s.lessonId),
              ),
            }
          : s,
      ),
    ),
    [profile, setProfile] = useState(() => initialProfile(a));
  const [sessionDrafts, setSessionDrafts] = useState<
    Record<string, { date?: string; time?: string; issue?: string }>
  >({});
  const [identityDraft, setIdentityDraft] = useState({ ...initialAnswers });
  const [savedProfile, setSavedProfile] = useState(() => initialProfile(a)),
    [offline, setOffline] = useState(false),
    [aiUnavailable, setAiUnavailable] = useState(false),
    [notice, setNotice] = useState("");
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>(
      {},
    ),
    [messages, setMessages] = useState<
      Record<string, { body: string; mine: boolean }[]>
    >({
      lea: [
        {
          body: "Hi! Could we practise asking for a recommendation next time?",
          mine: false,
        },
      ],
      lucas: [
        {
          body: "I found a conversation that was a little too fast. Can we work on that?",
          mine: false,
        },
      ],
      maya: [
        {
          body: "I’d love to practise my opening for Monday’s meeting.",
          mine: false,
        },
      ],
      noah: [
        {
          body: "Would Tuesday at 11:00 work for an online lesson?",
          mine: false,
        },
      ],
    });
  const [feedback, setFeedback] = useState(""),
    [feedbackShared, setFeedbackShared] = useState(false),
    [availability, setAvailability] = useState({
      days: ["Mon", "Tue", "Thu", "Fri"],
      start: "09:00",
      end: "17:00",
      zone: "Europe/Paris",
    }),
    [availabilitySaved, setAvailabilitySaved] = useState(false);
  const updateLesson = (id: string, patch: Partial<Lesson>) =>
    setLessons((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const updateSession = (id: string, patch: Partial<Session>) =>
    setSessions((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const attempt = (success: () => void, label: string) => {
    if (offline) {
      setNotice(
        "Connection unavailable. Your draft is kept. Reconnect in Account settings and retry.",
      );
      return false;
    }
    success();
    setNotice(label);
    return true;
  };
  return {
    sessionDrafts,
    setSessionDrafts,
    identityDraft,
    setIdentityDraft,
    lessons,
    setLessons,
    sessions,
    setSessions,
    profile,
    setProfile,
    savedProfile,
    setSavedProfile,
    offline,
    setOffline,
    aiUnavailable,
    setAiUnavailable,
    notice,
    setNotice,
    messageDrafts,
    setMessageDrafts,
    messages,
    setMessages,
    feedback,
    setFeedback,
    feedbackShared,
    setFeedbackShared,
    availability,
    setAvailability,
    availabilitySaved,
    setAvailabilitySaved,
    updateLesson,
    updateSession,
    attempt,
  };
}
export const Workspace = createContext<
  ReturnType<typeof useWorkspaceState> & {
    mobile: boolean;
    setMobileRoot: (route: Route) => void;
  }
>(null!);
export const useWorkspace = () => useContext(Workspace);
