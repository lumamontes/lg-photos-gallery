import type { GetStaticPaths, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import Bridge from '@/components/Icons/Bridge'
import Logo from '@/components/Icons/Logo'
import Modal from '@/components/Modal'
import type { ImageProps } from '@/utils/types'
import { useLastViewedPhoto } from '@/utils/useLastViewedPhoto'
import client from 'libs/contentful'
import {  Entry } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { getHashString } from '@/utils/getHashString';
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


const Project: NextPage = ({ images, entry }: ProjectSlugProps) => {
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
            <p className="max-w-[40ch] text-gray-800/75 sm:max-w-[32ch]">
                {entry.smallDescription}
            </p>
            <div>
              {documentToReactComponents(entry.fullDescription)}
            </div>
            <Link
              className="pointer z-10 mt-6 rounded-lg border bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 md:mt-4"
              href="/"
            >
              Explore more projects
            </Link>
          </div>
          {images.map(({ id, public_id, format, blurDataUrl }) => (
            <Link
              key={id}
              href={{
                pathname: `/${slug}`,
                query: {photoId: getHashString(public_id)},
              }
              }
              as={`/${slug}/p/${getHashString(public_id)}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
              // className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="Gallery photo"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: 'translate3d(0, 0, 0)' }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
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
  const entry: MyEntry = await client.getEntry(slug);
  const project_images = {
    results: entry.fields.assets.map(asset => {
      return {
        height: asset.height,
        width: asset.width,
        public_id: asset.public_id,
        format: asset.format,
      }
    })}
  let reducedResults: ImageProps[] = []

  let i = 0
  for (let result of project_images.results) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
    })
    i++
  }

  const blurImagePromises = project_images.results.map(async (image: ImageProps) => {
    const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg,w_8,q_70/${image.public_id}.${image.format}`
    const { base64 } = await getBlurData(url)
    return base64
  })

  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises)

  for (let i = 0; i < reducedResults.length; i++) {
    reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i]
  }
  console.log(reducedResults)
  return {
    props: {
      images: reducedResults,
      entry: entry.fields
    },
  }
}


export async function getStaticPaths() {
  await avoidRateLimit();
  const entry: any = await client.getEntry('5LfwKllpyXoFuxsbyBaYvC');

  let fullPaths = [];

  entry.fields.projects.map(project => {
    fullPaths.push({ params: { slug: project.sys.id } })
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