import { getToken } from "./auth";

const API_URL = "https://backend-p4-klvc.onrender.com/api";
const STUDENT_NAME = "gabriel";

function getBaseHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", "x-nombre": STUDENT_NAME };
}
function getAuthHeaders(token: string): Record<string, string> {
  return { ...getBaseHeaders(), Authorization: `Bearer ${token}` };
}

export { saveToken, getToken, removeToken, isLoggedIn, getUserIdFromToken } from "./auth";

export interface User {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  seguidores?: string[];
  seguidos?: string[];
}

export interface Retweet {
  usuario: string;
  fecha: string;
}

export interface Comment {
  _id: string;
  contenido: string;
  autor: { _id: string; username: string };
  fecha: string;
}

export interface Post {
  _id: string;
  contenido: string;
  autor: { _id: string; username: string };
  likes: string[];
  retweets: Retweet[];
  comentarios: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  user: User;
  posts: Post[];
}

export interface PaginatedPosts {
  posts: Post[];
  totalPaginas: number;
  pagina: number;
  totalPosts: number;
}

function parseAuthResponse(data: Record<string, unknown>): { token: string; user: User } {
  const token = (data.token || data.access_token) as string;
  if (!token) throw new Error("La API no devolvio un token valido");
  return { token, user: (data.user || {}) as User };
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST", headers: getBaseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err.error as string) || "Credenciales incorrectas");
  }
  return parseAuthResponse(await res.json());
}

export async function register(username: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST", headers: getBaseHeaders(),
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err.error as string) || "Error al registrarse");
  }
  return parseAuthResponse(await res.json());
}

export async function getMe(): Promise<ProfileResponse> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/users/me`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al obtener tu perfil");
  return res.json();
}

// El timeline global esta en /api/home
export async function getPosts(page = 1, limit = 10): Promise<PaginatedPosts> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/home?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar los posts");
  return res.json();
}

export async function getPost(id: string): Promise<Post> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/posts/${id}`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Post no encontrado");
  return res.json();
}

export async function createPost(contenido: string): Promise<Post> {
  const token = getToken();
  if (!token) throw new Error("Debes iniciar sesion");
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST", headers: getAuthHeaders(token),
    body: JSON.stringify({ contenido }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err.error as string) || "Error al crear el post");
  }
  return res.json();
}

// Like es toggle con POST
export async function toggleLike(id: string): Promise<Post> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/posts/${id}/like`, { method: "POST", headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al dar like");
  return res.json();
}

// Retweet es toggle con POST
export async function toggleRetweet(id: string): Promise<Post> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/posts/${id}/retweet`, { method: "POST", headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al retuitear");
  return res.json();
}

export async function createComment(postId: string, contenido: string): Promise<Post> {
  const token = getToken();
  if (!token) throw new Error("Debes iniciar sesion");
  const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: "POST", headers: getAuthHeaders(token),
    body: JSON.stringify({ contenido }),
  });
  if (!res.ok) throw new Error("Error al comentar");
  return res.json();
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/users/${userId}/profile`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Usuario no encontrado");
  return res.json();
}

// Follow es toggle con POST, devuelve { siguiendo, user }
export async function toggleFollow(userId: string): Promise<{ siguiendo: boolean; user: User }> {
  const token = getToken();
  if (!token) throw new Error("Sin sesion");
  const res = await fetch(`${API_URL}/users/${userId}/follow`, { method: "POST", headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al seguir");
  return res.json();
}
