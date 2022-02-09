import { useEffect, useState } from 'react';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from "prismic-dom";

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    let totalWords = post.data.content.reduce((acc, content) => {
       const numberHeadingWords = content.heading.split(' ').length;
       const numberBodyWords = RichText.asText(content.body).split(' ').length
      return acc + numberHeadingWords + numberBodyWords;
    }, 0);

    setReadingTime(Math.ceil(totalWords / 200));
  }, [post]);

  return (
   <>
      <Header />
      <picture className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </picture>
      <main className={commonStyles.container}>
        <article className={styles.article}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <div>
              <FiCalendar />
              <time>{post.first_publication_date}</time>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock />
              <time>{readingTime} min</time>
            </div>
          </div>

          <div className={styles.contentArticle}>
            {post.data.content.map(content => (              
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>             
            ))}

          </div>
        </article>
      </main>
   </>
  )
}

// Get two posts and create as static pages
export const getStaticPaths: GetStaticPaths = async() => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],{
    fetch: ['post.title'],
    pageSize: 2,
  });

  const paths = posts.results.map(post => (
    {
      params: { slug: post.uid }
    }
  ));

  return {
    paths,
    fallback: true  
  }
};

// Get post by slug 
export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});
  
  const post = {
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content:  response.data.content.map(content => (
        {
          heading: content.heading,
          body: content.body,
        }
      )),
      
    },
    first_publication_date: response.first_publication_date,
    uid: response.uid
  }
 
  return {
    props: {
      post
    },
    revalidate: 60 * 30   // 30 minutos
  }
}
