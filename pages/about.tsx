import Container from "@/components/container";
import client from "libs/contentful";
import {  Entry } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { format } from "date-fns";

import Image from "next/image";

interface ImageFields {
    title: string;
    file: {
      url: string;
      details: {
        image: {
          width: number;
          height: number;
        };
      };
    };
  }
  
export interface ContactFields {
heading: string;
description: string;
}

interface AboutPageFields {
  slug: string;
  description: any;
  title: string;
  image: {
      fields: ImageFields;
  };
  contacts: string[];
}
  
  
interface MyEntry extends Entry<AboutPageFields>{};
  
type AboutPageData = {
  heading: string;
  description: any;
  updated_at: string;
  image: {
      alt: string;
      src: string;
      width: number;
      height: number;
  };
  contacts: string[];
};

interface aboutPageProps {
    about: AboutPageData,
    entry: MyEntry
}


  
export default function About({ about }: aboutPageProps) {
  return (
    <>
      <Container>
        <h1 className="mt-2 mb-3 text-3xl font-semibold tracking-tight text-center lg:leading-snug text-brand-primary lg:text-4xl dark:text-black">
          {about.heading}
        </h1>
        <div className="text-center">
            {documentToReactComponents(about.description)}
        </div>
        <div className="rounded-md aspect-square odd:translate-y-6 odd:md:translate-y-12 mb-6 md:max-w-md md:mx-auto">
            <Image
                src={`https:${about.image.src}`}
                alt={about.image.alt}
                width={about.image.width}
                height={about.image.height}
                layout="intrinsic"
                objectFit="cover"
                objectPosition="center"
            />
            </div>

        <div className="mx-auto prose text-center dark:prose-invert mt-14 leading-loose">
          <small className="text-gray-500"><em>Updated {about.updated_at}</em></small>
        </div>
        <div className="mx-auto mt-8">
          <h2 className="text-xl font-semibold">Contacts</h2>
          <ul className="list-none mt-4 space-y-2">
            {about.contacts.map((contact, index) => (
              <li key={index}>
                <a
                  href={contact}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  {contact}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>

  );
}


export async function getStaticProps() {
    const entry: MyEntry = await client.getEntry('4J0qvM4MWlSNDFmTQUZyad');
    const aboutPage = {
      heading: entry.fields.title,
      description: entry.fields.description,
      updated_at: format(
        new Date(entry.sys.updatedAt),
        'd MMM yyyy',
      ),
      image: {
        alt: entry.fields.image.fields.title,
        src: entry.fields.image.fields.file.url,
        width: entry.fields.image.fields.file.details.image.width,
        height: entry.fields.image.fields.file.details.image.height
      },
      contacts: entry.fields.contacts
    };
  
    return {
      props: {
        about: aboutPage
      },
    }
  }
  
  