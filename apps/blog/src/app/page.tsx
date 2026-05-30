import Link from 'next/link';

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

async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog`, {
      next: { revalidate: 60 }, // revalidar cada 60 segundos (ISR)
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter((p: BlogPost) => p.status === 'PUBLISHED');
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

function stripHtml(html?: string) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function Home() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <main className="hero-section">
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            ¡Bienvenido al Blog de FoundTeach!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Estamos preparando contenido increíble para ti. ¡Vuelve pronto!
          </p>
          <div className="actions">
            <a href="https://foundteach.com" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              Visitar FoundTeach
            </a>
          </div>
        </div>
      </main>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <main style={{ paddingBottom: '4rem' }}>
      {/* Artículo destacado */}
      <Link href={`/${featured.slug}`} className="featured-card" style={{ textDecoration: 'none' }}>
        <div
          className="featured-image"
          style={{
            backgroundImage: featured.coverImage ? `url(${featured.coverImage})` : undefined,
          }}
        />
        <div className="featured-body">
          {featured.tags?.length > 0 && (
            <div className="tag-list">
              {featured.tags.slice(0, 3).map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
          <h2 className="featured-title">{featured.title}</h2>
          <p className="featured-excerpt">
            {featured.metaDescription || stripHtml(featured.content).substring(0, 180) + '...'}
          </p>
          <div className="post-meta">
            <span>{featured.author}</span>
            <span>·</span>
            <span>{fmtDate(featured.publishedAt || featured.createdAt)}</span>
          </div>
        </div>
      </Link>

      {/* Resto de artículos */}
      {rest.length > 0 && (
        <div className="posts-grid">
          {rest.map((post) => (
            <Link key={post.id} href={`/${post.slug}`} className="post-card" style={{ textDecoration: 'none' }}>
              <div
                className="post-card-image"
                style={{
                  backgroundImage: post.coverImage ? `url(${post.coverImage})` : undefined,
                }}
              />
              <div className="post-card-body">
                {post.tags?.length > 0 && (
                  <div className="tag-list" style={{ marginBottom: '0.5rem' }}>
                    {post.tags.slice(0, 2).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                )}
                <h3 className="post-card-title">{post.title}</h3>
                <p className="post-card-excerpt">
                  {post.metaDescription || stripHtml(post.content).substring(0, 100) + '...'}
                </p>
                <div className="post-meta" style={{ marginTop: '1rem' }}>
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{fmtDate(post.publishedAt || post.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
