import client from 'libs/contentful'
import type { NextPage } from 'next'
import Link from 'next/link'
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

// Define the type for a blog post
interface BlogPost {
  title: string;
  content: any;
  banner: string;
  first_publication_date: string;
  author: string;
  slug: string;
  subtitle?: string;
}

const Blogs: NextPage = ({posts} : { posts: BlogPost[]} ) => {
  return (
      <div className="container mx-auto max-w-xl px-8 mt-20">
          <div className="posts">
            {posts ? posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug}>
                <div className="mt-12 transition-transform filter hover:brightness-90 cursor-pointer">
                  <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                  <p>{post.subtitle ?? post.title}</p>
                  <div className="info flex gap-6 mt-6">
                    <time className="flex items-center gap-2 text-sm">
                      <FiCalendar className="text-lg" />
                      {post.first_publication_date}
                    </time>
                    <p className="flex items-center gap-2 text-sm">
                      <FiUser className="text-lg" />
                      {post.author}
                    </p>
                  </div>
                </div>
              </Link>
            )) : <p>No posts found</p>}
          </div>
      </div>
  )
}

export default Blogs;

export async function getStaticProps() {
  const entries = await client.getEntries({
    content_type: 'blogPost', 
  });
  const posts = entries.items.map((item: any) => {
    return {
      ...item.fields,
      uuid: item.fields.slug, 
      first_publication_date: format(
        new Date(item.sys.createdAt),
        'dd LLL yyyy',
        {
          locale: ptBR,
        }
      ),
      author: 'Luana',
      banner: item.fields.banner?.fields?.file?.url || '',
    };
  });

  return {
    props: {
      posts: posts
    },
  }
}

