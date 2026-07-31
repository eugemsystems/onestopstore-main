import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiCalendar, FiUser } from "react-icons/fi";
import { getBlogBySlug } from "@lib/actions/pages.actions";

const stripHtml = (html) =>
  (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { blog } = await getBlogBySlug(slug);
  const title = blog?.meta_title || blog?.title || "Blog Post";
  const description = stripHtml(blog?.meta_description || blog?.description || "").slice(0, 155);
  return { title, description };
}

const BlogDetailPage = async ({ params }) => {
  const { slug } = await params;
  const { blog } = await getBlogBySlug(slug);

  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-md mx-auto px-3 sm:px-10 py-10">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary mb-6"
        >
          <FiArrowLeft /> Back to Blog
        </Link>

        {blog?.blog_thumbnail?.image_url && (
          <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-muted mb-6">
            <Image
              src={blog.blog_thumbnail.image_url}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="768px"
              priority
            />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-5 mb-6">
          {blog?.created_by?.name && (
            <span className="flex items-center gap-1.5">
              <FiUser size={14} /> {blog.created_by.name}
            </span>
          )}
          {blog?.created_at && (
            <span className="flex items-center gap-1.5">
              <FiCalendar size={14} /> {new Date(blog.created_at).toLocaleDateString()}
            </span>
          )}
          {blog?.categories?.map((cat) => (
            <span
              key={cat.slug || cat.name}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
            >
              {cat.name}
            </span>
          ))}
        </div>

        <div
          className="prose prose-sm sm:prose-base max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: blog?.content || blog?.description || "" }}
        />
      </div>
    </div>
  );
};

export default BlogDetailPage;
