"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPosts, createPost, getToken, Post } from "@/lib/api";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    setError("");
    getPosts(page)
      .then((data) => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPaginas || 1);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, ready]);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;
    setPosting(true);
    setPostError("");
    try {
      const post = await createPost(newContent.trim());
      setPosts((prev) => [post, ...prev]);
      setNewContent("");
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : "Error al publicar");
    } finally { setPosting(false); }
  }

  if (!ready) return null;

  return (
    <div>
      <h1 className="section-title">Ultimos posts</h1>
      <div className="card" style={{ marginBottom: "20px" }}>
        <form onSubmit={handlePublish}>
          <div className="form-group">
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Que esta pasando?" rows={3} maxLength={280} />
          </div>
          {postError && <p className="form-error" style={{ marginBottom: "8px" }}>{postError}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>{newContent.length}/280</span>
            <button type="submit" className="btn-primary" disabled={posting || !newContent.trim()}>
              {posting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
      {loading && <p className="loading">Cargando posts...</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && posts.map((post) => <PostCard key={post._id} post={post} />)}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
          <span>Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</button>
        </div>
      )}
    </div>
  );
}
