"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProfile, toggleFollow, getToken, User, Post } from "@/lib/api";
import PostCard from "@/components/PostCard";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    try {
      const payload = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      setMyId(payload.id);
    } catch {}
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || !id) return;
    setLoading(true);
    getProfile(id)
      .then((data) => {
        setUser(data.user);
        setPosts(data.posts || []);
        setIsFollowing(Array.isArray(data.user.seguidores) && data.user.seguidores.includes(myId!));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, ready, myId]);

  async function handleFollow() {
    if (!user || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await toggleFollow(user._id);
      setIsFollowing(res.siguiendo);
      setUser(res.user);
    } catch {} finally { setFollowLoading(false); }
  }

  if (!ready) return null;
  if (loading) return <p className="loading">Cargando perfil...</p>;
  if (error) return <p className="error-msg">{error}</p>;
  if (!user) return null;

  const isMe = myId === user._id;

  return (
    <div>
      <div className="card" style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", marginBottom: "4px" }}>@{user.username}</h1>
        {user.bio && <p style={{ color: "#444", marginBottom: "12px" }}>{user.bio}</p>}
        <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#666", marginBottom: "14px" }}>
          <span><strong>{user.seguidores?.length ?? 0}</strong> seguidores</span>
          <span><strong>{user.seguidos?.length ?? 0}</strong> siguiendo</span>
        </div>
        {!isMe && (
          <button className={isFollowing ? "btn-secondary" : "btn-primary"} onClick={handleFollow} disabled={followLoading}>
            {followLoading ? "..." : isFollowing ? "Dejar de seguir" : "Seguir"}
          </button>
        )}
      </div>

      <h2 className="section-title">Posts de @{user.username}</h2>
      {posts.length === 0 && <p style={{ color: "#666" }}>Sin posts todavia.</p>}
      {posts.map((post) => <PostCard key={post._id} post={post} />)}
    </div>
  );
}
