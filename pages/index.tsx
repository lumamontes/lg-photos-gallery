import Container from '@/components/container'
import Navbar from '@/components/Navbar'
import Project from '@/components/organisms/Project'
import client from 'libs/contentful'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {  Entry } from 'contentful';
import { Heading } from '@/components/atoms/Heading'
import { Text } from '@/components/atoms/Text'

interface ProjectFields {
  id: string;
  title: string;
  smallDescription: string;
  fullDescription: string;
  assets: {
    created_at: string;
    format: string;
    height: number;
    width: number;
    public_id: string;
    url: string;
  }[];
}


interface MyEntryFields {
  title: string;
  description: string;
  project: ProjectFields[];
}

interface MyEntry extends Entry<MyEntryFields>{};

interface PortfolioPageProps {
  portfolioPage: {
    title: string;
    description: string;
    projects: ProjectFields[];
  };
}


const Home: NextPage = ({ portfolioPage }: PortfolioPageProps) => {
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content="https://archivebyluana.vercel.app/og-image.png"
        />
        <meta
          name="twitter:image"
          content="https://archivebyluana.vercel.app/og-image.png"
        />
      </Head>
      <main>
      <Container>
        <Heading>{portfolioPage?.title}</Heading>
        <Text className='my-10' asChild><p> {portfolioPage?.description}</p></Text>
        <div className="grid grid-col-1 md:grid-cols-3 gap-4">
        {
          portfolioPage.projects.length > 0 && portfolioPage.projects.map((project: any, index) => (
              <Project key={index} title={project.title} description={project.smallDescription} name={project.id} slug={project.slug}/>
          ))
        }
        </div>
        </Container>
      </main>
    </>
  )
}

export default Home

export async function getStaticProps() {
  const entry: MyEntry = await client.getEntry('ECYHyqz3zOKgJ4f5XaD3V');

  const portfolioPage = {
    title: entry.fields.title,
    description: entry.fields.description,
    projects: entry.fields.project.map((project: any) => ({
      id: project.sys.id,
      title: project.fields.title,
      slug: project.fields.uuid,
      smallDescription: project.fields.smallDescription || '',
      fullDescription: project.fields.fullDescription || '',
      assets: (project.fields.assets || []).map((asset) => ({
        created_at: asset.sys.createdAt,
        format: asset.fields.file.contentType,
        height: asset.fields.file.details.image.height,
        width: asset.fields.file.details.image.width,
        public_id: asset.sys.id,
        url: asset.fields.file.url,
      })),
    })),
  }

  return {
    props: {
      portfolioPage
    },
  }
}

