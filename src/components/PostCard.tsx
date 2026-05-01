"use client";
import Link from "next/link";
import { useState } from "react";
import { Post, toggleLike, toggleRetweet, getToken } from "@/lib/api";

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function getUserId(): string | null {
  const t = getToken();
  if (!t) return null;
  try { return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).id; }
  catch { return null; }
}

export default function PostCard({ post: initialPost }: { post: Post }) {
  const uid = getUserId();
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(false);

  const liked = Array.isArray(post.likes) && post.likes.includes(uid!);
  const retweeted = Array.isArray(post.retweets) && post.retweets.some(r => r.usuario === uid);

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try { const updated = await toggleLike(post._id); setPost(updated); }
    catch {} finally { setLoading(false); }
  }

  async function handleRetweet(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try { const updated = await toggleRetweet(post._id); setPost(updated); }
    catch {} finally { setLoading(false); }
  }

  return (
    <div className="card">
      <div>
        <Link href={`/profile/${post.autor?._id}`} style={{ textDecoration: "none", color: "inherit" }} onClick={e => e.stopPropagation()}>
          <span className="post-author">@{post.autor?.username}</span>
        </Link>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      <Link href={`/post/${post._id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <p className="post-content">{post.contenido}</p>
      </Link>
      <div className="post-actions">
        <button className={liked ? "active" : ""} onClick={handleLike} disabled={loading}>
          Me gusta {post.likes?.length ?? 0}
        </button>
        <button className={retweeted ? "active" : ""} onClick={handleRetweet} disabled={loading}>
          {retweeted ? "Retuiteado" : "Retuitear"} {post.retweets?.length ?? 0}
        </button>
      </div>
    </div>
  );
}
