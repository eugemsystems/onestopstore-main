import Link from "next/link";
import Image from "next/image";
import { FiClock, FiArrowRight } from "react-icons/fi";
import PageHeader from "@components/header/PageHeader";
import { getBlogs } from "@lib/actions/pages.actions";

export const metadata = {
  title: "Blog",
  description: "Shopping guides, product reviews, tips and news.",
};

const stripHtml = (html) =>
  (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

const BlogsPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { blogs, lastPage, currentPage } = await getBlogs({ page: Number(page || 1) });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={{ en: "Blog" }} />

      <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-10">
        {blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 w-full bg-muted">
                    {blog?.blog_thumbnail?.image_url ? (
                      <Image
                        src={blog.blog_thumbnail.image_url}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">📝</div>
                    )}
                    {blog?.categories?.[0]?.name && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {blog.categories[0].name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FiClock size={12} />
                      {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ""}
                    </span>
                    <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                      {blog.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground flex-1">
                      {stripHtml(blog.description).slice(0, 150)}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read More <FiArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {lastPage > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blogs?page=${p}`}
                    className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                      p === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <span className="text-4xl">📝</span>
            <p className="text-sm text-muted-foreground">No blog posts yet — check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
