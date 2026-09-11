import { loginAccount } from "@/lib/store.functions";

const SESSION_KEY = "tawoos-admin-session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  permissions: string[];
}

type Listener = () => void;
const listeners = new Set<Listener>();

function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
  listeners.forEach((fn) => fn());
}

export function getSessionUser(): SessionUser | null {
  return readSession();
}

export async function signIn(email: string, password: string) {
  const result = await loginAccount({ data: { email, password } });
  if (result.error || !result.user) return { error: true };
  writeSession(result.user);
  return { error: false };
}

export function signOut() {
  writeSession(null);
}

export function onAuthChange(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
