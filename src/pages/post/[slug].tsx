import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
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
  // TODO
  return (
   <>
      <Link href={`/`}>
        <a>
          <Header />
        </a>
      </Link>
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
              <time>4 min</time>
            </div>
          </div>

          <div className={styles.contentArticle}>
            {post.data.content.map(content => (              
              <>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </>             
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
  
   console.log(response);

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
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
      
    }
  }
 
  return {
    props: {
      post
    },
    revalidate: 60 * 30   // 30 minutos
  }
}
