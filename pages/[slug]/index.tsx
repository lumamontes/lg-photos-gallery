import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import Modal from '@/components/Modal'
import type { ImageProps } from '@/utils/types'
import { useLastViewedPhoto } from '@/utils/useLastViewedPhoto'
import client from 'libs/contentful'
import {  Entry } from 'contentful';
import { getBlurData } from '@/utils/blur-data-generator'

interface ProjectSlugProps {
    title: string;
    description: string;
    size?: 'sm' | 'md' | 'lg';
    asChild?: boolean;
    name: string;
    images?: ImageProps[];
    entry: any,
    fullDescription: any;
    smallDescription: string;
}

interface AboutPageFields {
  heading: string;
  description: string;
  smallDescription: string;
  fullDescription: any;
  assets: any
  }
    
    
interface MyEntry extends Entry<AboutPageFields>{};


const Project: NextPage<ProjectSlugProps> = ({ images, entry }) => {
  const router = useRouter()
  const { photoId, slug } = router.query
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto()

    
  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current.scrollIntoView({ block: 'center' })
      setLastViewedPhoto(null)
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto])

  return (
    <>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId)
            }}
          />
        )}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="border after:content relative mb-5 flex min-h-[429px] flex-col items-center justify-center gap-4 overflow-hidden rounded-lg px-6 pb-16 pt-64 text-center text-gray-800  after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0 shadow-xl transition-shadow hover:shadow-lg sm:p-6 lg:p-">
            <h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest">
                {entry.title}
            </h1>
            <div>
              {entry.smallDescription}
            </div>
            <Link
              className="pointer z-10 mt-6 rounded-lg border bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 md:mt-4"
              href="/"
            >
              Explore more projects / Explorar 
            </Link>
          </div>
          {images.map(({ id, url, format, blurDataUrl }) => (
            <Link
              key={id}
              href={`/${entry.uuid}?photoId=${id}`}
              as={`/${entry.uuid}/p/${(id)}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="relative mb-5 block w-full cursor-zoom-in group after:content-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="Gallery photo"
                className="transform rounded-lg brightness-90 transition group-hover:brightness-110"
                style={{ transform: 'translate3d(0, 0, 0)' }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={`https:${url}`}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
              />
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export default Project


export async function getStaticProps({params}) {
  const { slug } = params;
  await avoidRateLimit();
  const entry = await client.getEntries({
    content_type: 'project', // Replace with the correct content type for your project entries
    'fields.uuid': slug,
    limit: 1,
  });

  if (!entry.items.length) {
    return { notFound: true };
  }
  
  const project = entry.items[0] as any;
  const project_images = project.fields.assets.map((asset) => ({
    height: asset.fields.file.details.image.height,
    width: asset.fields.file.details.image.width,
    public_id: asset.sys.id,
    format: asset.fields.file.contentType.split('/')[1], // Get file format from contentType
    url: asset.fields.file.url,
    title: asset.fields.title,
  }));

  // Generate blur data for images
  const blurImagePromises = project_images.map(async (image) => {
    const url = `https:${image.url}`;
    const { base64 } = await getBlurData(url);
    return { ...image, blurDataUrl: base64, id: image.title };
  });

  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  return {
    props: {
      images: imagesWithBlurDataUrls,
      entry: project.fields,
    },
  }
}


export async function getStaticPaths() {
  await avoidRateLimit();
  const entry: any = await client.getEntry('ECYHyqz3zOKgJ4f5XaD3V');

  let fullPaths = [];

  entry.fields.project.map(project => {
    fullPaths.push({ params: { slug: project.fields.uuid } })
  })

  return {
    paths: fullPaths,
    fallback: false,
  }
}


export function avoidRateLimit(delay = 500) {
  if (!process.env.IS_BUILD) {
    return
  }

  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}