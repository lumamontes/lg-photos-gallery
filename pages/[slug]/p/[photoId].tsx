import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Carousel from '@/components/Carousel';
import type { ImageProps } from '@/utils/types';
import client from 'libs/contentful';
import { getBlurData } from '@/utils/blur-data-generator';

interface PhotoIdProps {
  currentPhoto: ImageProps;
}

const PhotoId: NextPage<PhotoIdProps> = ({ currentPhoto }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  
  if (!currentPhoto) {
    return <div>Photo not found./ Foto não encontrada.</div>;
  }

  const currentPhotoUrl = `https:${currentPhoto.url}`;
  console.log('currentPhotoUrl', currentPhotoUrl)
  return (
    <>
      <Head>
        <meta property="og:image" content={currentPhotoUrl} />
        <meta name="twitter:image" content={currentPhotoUrl} />
      </Head>
      <div className="relative mx-auto max-w-[1960px] h-full p-4">
        <Carousel index={currentPhoto.id} currentPhoto={currentPhoto} slug={slug} />
      </div>
    </>
  );
};

export async function getStaticPaths() {
  const entry = await client.getEntry('ECYHyqz3zOKgJ4f5XaD3V') as any; // Replace with the correct ID for the main entry containing projects

  const projects = entry.fields.project
  const paths = projects.flatMap((project) =>
    (project.fields.assets).map((asset) =>
       ({
      params: {
        slug: project.fields.uuid, // Use `uuid` as the slug
        photoId: asset.fields.title, // Use the asset's sys.id as the photoId
      },
    })
  )
  );

  return {
    paths,
    fallback: false, // Change to 'blocking' if using ISR
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug, photoId } = params as { slug: string; photoId: string };

  // Fetch project by slug (uuid)
  const entry = await client.getEntries({
    content_type: 'project', // Replace with your Contentful content type for projects
    'fields.uuid': slug,
    limit: 1,
  });

  if (!entry.items.length) {
    return { notFound: true };
  }

  const project = entry.items[0] as any;
  const asset = project.fields.assets.find((a: any) => a.fields.title === photoId);

  if (!asset) {
    return { notFound: true };
  }

  const currentPhoto: ImageProps = {
    id: asset.fields.title,
    public_id: asset.sys.id, // Optional, if sys.id is required elsewhere
    format: asset.fields.file.contentType.split('/')[1],
    url: asset.fields.file.url, // Use the image URL from Contentful
    height: asset.fields.file.details.image.height,
    width: asset.fields.file.details.image.width,
  };

  // Generate blur data for the image
  const blurImageUrl = `https:${currentPhoto.url}`;
  const { base64 } = await getBlurData(blurImageUrl);
  currentPhoto.blurDataUrl = base64;

  return {
    props: {
      currentPhoto,
    },
  };
};


export default PhotoId;
