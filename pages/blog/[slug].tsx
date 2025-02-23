import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from "@contentful/rich-text-types";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import client from 'libs/contentful';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiUser } from 'react-icons/fi';
import Markdown from 'react-markdown'
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: string;
    author: string;
    reading_time: number;
    content: string;
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p className="text-center mt-10 text-lg">Carregando...</p>;
  }

  return (
      <section className="container mx-auto">
        <div className="h-[60vh]">
          <img
            src={post.data.banner}
            alt={post.data.title}
            className="w-full h-full object-cover"
          />
        </div>
        <article className="max-w-3xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-6">{post.data.title}</h1>
          <div className="flex flex-col sm:flex-row gap-6 text-gray-600 mb-8">
            <time className="flex items-center gap-2 text-sm">
              {post.first_publication_date}
            </time>
            <p className="flex items-center gap-2 text-sm">
              <FiUser className="text-lg" />
              {post.data.author}
            </p>
          </div>
          <div className="space-y-8 py-8 pb-16">
            {documentToReactComponents(post.data.content as any, {
            renderNode: {
              [BLOCKS.EMBEDDED_ASSET]: (node) => {
                return (<Image
                  src={`https:${node.data.target.fields.file.url}`}
                  height={node.data.target.fields.file.details.image.height}
                  width={node.data.target.fields.file.details.image.width}
                  alt={node.data.target.fields.title}
                />)
              }
            }
          })}
        </div>
        </article>
      </section>
  );
}

export async function getStaticPaths() {
  const entries = await client.getEntries({
    content_type: 'blogPost',
  }) as any;

  const paths = entries.items.map(item => ({
    params: { slug: item.fields.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    'fields.slug': params.slug,
  });

  if (!entries.items.length) {
    return { notFound: true };
  }

  const post = entries.items[0].fields as any

  const formattedPost = {
    first_publication_date: format(
      new Date(entries.items[0].sys.createdAt),
      'dd LLL yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: post.title,
      banner: post.banner?.fields?.file?.url || '',
      author: post.author || 'Luana',
      content: post.post
    },
  };

  return {
    props: {
      post: formattedPost,
    },
    revalidate: 10,
  };
}
