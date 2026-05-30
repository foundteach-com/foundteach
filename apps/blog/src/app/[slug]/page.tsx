import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.foundteach.com';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  status: string;
  coverImage?: string;
  metaDescription?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
}

async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug && p.status === 'PUBLISHED') ?? null;
}

// Genera rutas estáticas en build time
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.status === 'PUBLISHED')
    .map((p) => ({ slug: p.slug }));
}

// SEO dinámico por artículo
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Artículo no encontrado | FoundTeach Blog' };
  return {
    title: `${post.title} | FoundTeach Blog`,
    description: post.metaDescription || `Lee el artículo "${post.title}" en el Blog de FoundTeach.`,
    openGraph: {
      title: post.title,
      description: post.metaDescription || '',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="article-container">
      {/* Botón volver */}
      <Link href="/" className="back-link">
        ← Volver al Blog
      </Link>

      {/* Cabecera */}
      <header className="article-header">
        {post.tags?.length > 0 && (
          <div className="tag-list" style={{ marginBottom: '1rem' }}>
            {post.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
        <h1 className="article-title">{post.title}</h1>
        <div className="post-meta" style={{ marginTop: '0.75rem' }}>
          <span>{post.author}</span>
          <span>·</span>
          <span>{fmtDate(post.publishedAt || post.createdAt)}</span>
        </div>
      </header>

      {/* Imagen de portada */}
      {post.coverImage && (
        <div
          className="article-cover"
          style={{ backgroundImage: `url(${post.coverImage})` }}
        />
      )}

      {/* Contenido HTML generado por Tiptap */}
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </article>
  );
}
