/**
 * Adaptador opcional. El MVP no importa el SDK de Firebase para no añadir
 * coste, peso ni secretos. Si existen variables VITE_FIREBASE_*, una fase
 * posterior puede montar Auth/Firestore sin cambiar las páginas.
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

export function readFirebaseConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !authDomain || !projectId) return null;
  return { apiKey, authDomain, projectId };
}
