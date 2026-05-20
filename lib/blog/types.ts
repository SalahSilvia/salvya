export type BlogPostStatus = "draft" | "published" | "archived";

export type SalvyaBlogRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body_md: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  tags: string[];
  status: BlogPostStatus;
  featured: boolean;
  read_time_minutes: number;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  bodyMd: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  tags: string[];
  status: BlogPostStatus;
  featured: boolean;
  readTimeMinutes: number;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminBlogPost = BlogPost;

export function rowToBlogPost(row: SalvyaBlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    bodyMd: row.body_md,
    coverImage: row.cover_image,
    authorName: row.author_name,
    authorRole: row.author_role,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: parseBlogStatus(row.status),
    featured: row.featured,
    readTimeMinutes: row.read_time_minutes,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseBlogStatus(v: unknown): BlogPostStatus {
  if (v === "published" || v === "archived") return v;
  return "draft";
}

export function blogPostToRow(
  post: Omit<BlogPost, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Omit<SalvyaBlogRow, "created_at" | "updated_at"> {
  return {
    id: post.id ?? "",
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    body_md: post.bodyMd,
    cover_image: post.coverImage,
    author_name: post.authorName,
    author_role: post.authorRole,
    tags: post.tags,
    status: post.status,
    featured: post.featured,
    read_time_minutes: post.readTimeMinutes,
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    published_at: post.publishedAt,
  };
}
