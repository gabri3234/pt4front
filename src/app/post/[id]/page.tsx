"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPost, createComment, toggleLike, toggleRetweet, getToken, Post } from "@/lib/api";

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getUserId(token: string): string | null {
  try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).id; }
  catch { return null; }
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    setUid(getUserId(t));
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || !id) return;
    getPost(id)
      .then(setPost)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, ready]);

  async function handleLike() {
    if (!post || actionLoading) return;
    setActionLoading(true);
    try { const updated = await toggleLike(post._id); setPost(updated); }
    catch {} finally { setActionLoading(false); }
  }

  async function handleRetweet() {
    if (!post || actionLoading) return;
    setActionLoading(true);
    try { const updated = await toggleRetweet(post._id); setPost(updated); }
    catch {} finally { setActionLoading(false); }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!post || !commentText.trim()) return;
    setCommenting(true);
    setCommentError("");
    try {
      const updated = await createComment(post._id, commentText.trim());
      setPost(updated);
      setCommentText("");
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : "Error al comentar");
    } finally { setCommenting(false); }
  }

  if (!ready) return null;
  if (loading) return <p className="loading">Cargando post...</p>;
  if (error) return <p className="error-msg">{error}</p>;
  if (!post) return null;

  const liked = Array.isArray(post.likes) && post.likes.includes(uid!);
  const retweeted = Array.isArray(post.retweets) && post.retweets.some(r => r.usuario === uid);

  return (
    <div>
      <Link href="/" style={{ fontSize: "14px", display: "block", marginBottom: "16px" }}>Volver</Link>
      <div className="card">
        <div>
          <Link href={`/profile/${post.autor?._id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <span className="post-author">@{post.autor?.username}</span>
          </Link>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
        <p className="post-content" style={{ fontSize: "17px", margin: "14px 0" }}>{post.contenido}</p>
        <div className="post-actions">
          <button className={liked ? "active" : ""} onClick={handleLike} disabled={actionLoading}>Me gusta {post.likes?.length ?? 0}</button>
          <button className={retweeted ? "active" : ""} onClick={handleRetweet} disabled={actionLoading}>{retweeted ? "Retuiteado" : "Retuitear"} {post.retweets?.length ?? 0}</button>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: "20px" }}>Comentarios ({post.comentarios?.length ?? 0})</h2>
      {(!post.comentarios || post.comentarios.length === 0) && <p style={{ color: "#666", marginBottom: "16px" }}>Sin comentarios todavia.</p>}
      {post.comentarios?.map((c) => (
        <div key={c._id} className="card">
          <div>
            <span className="post-author">@{c.autor?.username}</span>
            <span className="post-date">{formatDate(c.fecha)}</span>
          </div>
          <p className="post-content">{c.contenido}</p>
        </div>
      ))}

      <div className="card" style={{ marginTop: "16px" }}>
        <form onSubmit={handleComment}>
          <div className="form-group">
            <label>Anadir comentario</label>
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3} />
          </div>
          {commentError && <p className="form-error" style={{ marginBottom: "8px" }}>{commentError}</p>}
          <button type="submit" className="btn-primary" disabled={commenting || !commentText.trim()}>
            {commenting ? "Enviando..." : "Comentar"}
          </button>
        </form>
      </div>
    </div>
  );
}
