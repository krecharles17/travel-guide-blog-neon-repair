import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useArticleComments } from "@/hooks/useContent";
import { toast } from "@/hooks/use-toast";

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "just now";
};

const ArticleComments = ({ articleId }: { articleId: string }) => {
  const { comments, isLoading, addComment } = useArticleComments(articleId);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 1 || body.trim().length < 2) return;
    try {
      await addComment.mutateAsync({ name, body });
      setBody("");
      toast({ title: "Comment posted", description: "Thanks for joining the conversation." });
    } catch {
      toast({ title: "Could not post comment", description: "Please try again in a moment.", variant: "destructive" });
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h2 className="font-display text-2xl font-bold text-foreground italic">
          {isLoading ? "Comments" : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-earth-cream border border-border rounded-lg p-6 mb-8 space-y-4">
        <div className="grid md:grid-cols-[220px_1fr] gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            required
            className="border border-border rounded-md px-4 py-3 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience of this destination…"
            rows={3}
            maxLength={2000}
            required
            className="border border-border rounded-md px-4 py-3 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={addComment.isPending}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2 disabled:opacity-60"
        >
          {addComment.isPending ? "Posting…" : "Post comment"} <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <article key={c.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {c.author_name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{c.author_name}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
          </article>
        ))}
        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet — be the first to share your tips.
          </p>
        )}
      </div>
    </section>
  );
};

export default ArticleComments;
