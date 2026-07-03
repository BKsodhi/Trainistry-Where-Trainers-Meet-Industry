import { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, ShieldCheck, AlertTriangle, Trophy, Flag, Filter, Plus, Image as ImageIcon, Briefcase, ThumbsUp, MoreHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiClient } from "../utils/apiClient";

const TYPE_CONFIG = {
  achievement: { icon: Trophy, label: "Achievement", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  milestone: { icon: Trophy, label: "Milestone", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  warning: { icon: AlertTriangle, label: "Warning Post", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const FILTERS = ["All", "Achievements", "Milestones", "Warnings"];

export function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [postType, setPostType] = useState("achievement");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const { role, user } = useApp();

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const n = new Set(prev);
      n.has(postId) ? n.delete(postId) : n.add(postId);
      return n;
    });
  };

  const submitComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    
    // Optimistic UI
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { 
          ...p, 
          comments: p.comments + 1,
          commentsList: [...(p.commentsList || []), {
            _id: "temp-" + Date.now(),
            text,
            authorName: user?.email?.split('@')[0] || "You",
            authorAvatar: user?.email?.charAt(0).toUpperCase() || "Y"
          }]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    try {
      await apiClient(`/feed/${postId}/comment`, { method: "POST", bodyData: { text } });
      fetchPosts(); // fetch full data to get populated DB ObjectId
    } catch (e) {
      fetchPosts(); // revert on fail
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
    try {
      await apiClient(`/feed/${postId}/like`, { method: "POST" });
    } catch (e) {
      fetchPosts(); // revert on fail
    }
  };

  const handleShare = async (content: string) => {
    try {
      await navigator.clipboard.writeText(`Check out this update on Trainistry: "${content.substring(0, 50)}..."\n\nJoin the B2B training network!`);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link.");
    }
  };


  const handleReport = async (postId: string) => {
    if (!window.confirm("Are you sure you want to report this post?")) return;
    try {
      const res = await apiClient(`/feed/${postId}/report`, { method: "POST" });
      if (res.success) {
        alert("Post flagged for Admin review.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await apiClient("/feed");
      if (res.success && res.data) {
        const formatted = res.data.map((p: any) => ({
          id: p._id,
          type: p.type,
          content: p.content,
          author: {
            name: p.authorId?.email?.split('@')[0] || "Unknown",
            title: p.authorRole === "COMPANY" ? "Company Representative" : "Technical Trainer",
            avatar: p.authorId?.email?.charAt(0).toUpperCase() || "U",
            verified: true,
          },
          timestamp: new Date(p.createdAt).toLocaleDateString(),
          likes: p.likedBy?.length || p.likes || 0,
          isLiked: p.likedBy?.includes(user?.id) || false,
          comments: p.commentsList?.length || p.comments || 0,
          reports: p.reports || 0,
          commentsList: p.commentsList?.map((c: any) => ({
            _id: c._id,
            text: c.text,
            authorName: c.userId?.email?.split('@')[0] || "Unknown",
            authorAvatar: c.userId?.email?.charAt(0).toUpperCase() || "U",
            date: new Date(c.date).toLocaleDateString()
          })) || []
        }));
        setPosts(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch feed posts", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient("/feed", {
        method: "POST",
        bodyData: { content: newPostContent, type: postType }
      });
      if (res.success) {
        setNewPostContent("");
        fetchPosts(); // Refresh the feed
      }
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = posts.filter((p) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Achievements") return p.type === "achievement";
    if (activeFilter === "Milestones") return p.type === "milestone";
    if (activeFilter === "Warnings") return p.type === "warning";
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={12} className="text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-3 py-1 rounded text-xs transition-all border"
            style={
              activeFilter === f
                ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" }
                : { background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Compose box (trainers/companies only) */}
      {role !== "admin" && (
        <div className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "var(--primary)" }}>
              {role === "trainer" ? "AM" : "LT"}
            </div>
            <textarea
              rows={2}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share an achievement, milestone, or professional update…"
              className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex items-center justify-between mt-2 ml-11">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="achievement">Achievement</option>
              <option value="milestone">Milestone</option>
              <option value="warning">Warning Post</option>
            </select>
            <button
              onClick={handlePost}
              disabled={isSubmitting || !newPostContent.trim()}
              className={`px-4 py-1.5 rounded text-xs font-medium text-white transition-opacity ${isSubmitting || !newPostContent.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{ background: "var(--primary)" }}>
              {isSubmitting ? "Posting..." : `Post ${postType.charAt(0).toUpperCase() + postType.slice(1)}`}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg bg-[var(--card)]">
          No posts found. Be the first to share an achievement!
        </div>
      ) : filtered.map((post) => {
        const tc = TYPE_CONFIG[post.type as keyof typeof TYPE_CONFIG];
        const isWarning = post.type === "warning";

        return (
          <div
            key={post.id}
            className="rounded border overflow-hidden"
            style={{
              background: "var(--card)",
              borderColor: isWarning ? "rgba(239,68,68,0.25)" : "var(--border)",
            }}
          >
            {isWarning && (
              <div className="px-4 py-2 flex items-center gap-2 border-b"
                style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle size={11} className="text-destructive" />
                <span className="text-xs text-destructive font-medium">Admin-Verified Warning Post</span>
                <span className="ml-auto text-[10px] text-muted-foreground mono">
                  {post.reports} reports · Approved by Admin
                </span>
              </div>
            )}

            <div className="p-4">
              {/* Author */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: isWarning ? "#ef4444" : "var(--primary)" }}>
                  {post.author.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground text-sm">{post.author.name}</span>
                    {post.author.verified && <ShieldCheck size={11} className="text-primary flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{post.author.title} · {post.timestamp}</div>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                  style={{ background: tc.bg, color: tc.color }}>
                  <tc.icon size={9} />
                  <span>{tc.label}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: post.isLiked ? "#ef4444" : "var(--muted-foreground)" }}
                >
                  <Heart size={12} fill={post.isLiked ? "#ef4444" : "none"} />
                  {post.likes}
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <MessageSquare size={12} /> {post.comments}
                </button>
                <button onClick={() => handleShare(post.content)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 size={12} /> Share
                </button>
                {role !== "admin" && !isWarning && (
                  <button onClick={() => handleReport(post.id)} className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors">
                    <Flag size={10} /> Report
                  </button>
                )}
                {role === "admin" && !isWarning && (
                  <button className="ml-auto flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <AlertTriangle size={10} /> Flag as Warning
                  </button>
                )}
              </div>
              
              {/* LinkedIn-style Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* List of comments */}
                  {post.commentsList && post.commentsList.length > 0 ? (
                    <div className="space-y-3">
                      {post.commentsList.map((c: any) => (
                        <div key={c._id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-secondary border border-border">
                            {c.authorAvatar}
                          </div>
                          <div className="flex-1 bg-[var(--card)] border border-border px-3 py-2 rounded-xl text-xs">
                            <div className="font-semibold text-foreground">{c.authorName}</div>
                            <div className="text-muted-foreground mt-0.5 leading-relaxed">{c.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">No comments yet. Start the conversation!</div>
                  )}
                  
                  {/* Add comment input */}
                  <div className="flex gap-2 mt-2 pt-2 border-t border-dashed border-border/50">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white" style={{ background: "var(--primary)" }}>
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                        placeholder="Add a comment..."
                        className="flex-1 bg-input border border-border rounded-full px-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => { if(e.key === 'Enter') submitComment(post.id) }}
                      />
                      <button onClick={() => submitComment(post.id)} disabled={!commentInputs[post.id]?.trim()} className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-medium transition-opacity disabled:opacity-50">
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
