import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getAllBlogPosts } from "@/lib/data/blog";
import {
  deleteBlogPost,
  duplicateBlogPost,
  toggleBlogPostStatus,
} from "@/lib/actions/blog";

export const metadata: Metadata = { title: "Blog", robots: { index: false } };

export default async function AdminBlogListPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="gap-stack-md flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Blog</h1>
          <p className="text-on-surface-variant mt-1">
            Gérez les articles publiés et brouillons.
          </p>
        </div>
        <Button href="/admin/blog/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvel article
        </Button>
      </header>

      <GlassCard hover={false} className="p-0">
        {posts.length === 0 ? (
          <p className="text-on-surface-variant p-6 text-center">
            Aucun article pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-glass-stroke/30 hover:bg-surface-variant/10 border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-on-surface hover:text-primary font-medium"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          post.status === "PUBLISHED"
                            ? "bg-primary-container/10 text-primary rounded-full px-2.5 py-1 text-xs font-bold"
                            : "bg-surface-variant text-on-surface-variant rounded-full px-2.5 py-1 text-xs font-bold"
                        }
                      >
                        {post.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="text-on-surface-variant px-4 py-4">
                      {BLOG_CATEGORY_LABELS[post.category]}
                    </td>
                    <td className="text-on-surface-variant px-4 py-4">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </td>
                    <td className="text-on-surface-variant px-4 py-4">
                      {post.author.name}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          title="Modifier"
                          className="text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary rounded p-2"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <form action={toggleBlogPostStatus}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            type="submit"
                            title={
                              post.status === "PUBLISHED"
                                ? "Dépublier"
                                : "Publier"
                            }
                            className="text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary rounded p-2"
                          >
                            {post.status === "PUBLISHED" ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </form>
                        <form action={duplicateBlogPost}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            type="submit"
                            title="Dupliquer"
                            className="text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary rounded p-2"
                          >
                            <Copy className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </form>
                        <form action={deleteBlogPost}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            type="submit"
                            title="Supprimer"
                            className="text-on-surface-variant hover:bg-error/10 hover:text-error rounded p-2"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
