import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';

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

export default function Post() {
  // TODO
  return (
   <>
      <Header />
      <img src="" alt="" />
      <main>
        <article>
          <h1>Titulo do post</h1>
            <div className={styles.info}>
              <div>
                <FiCalendar />
                <time>10 Jan 2022</time>
              </div>
              <div>
                <FiUser />
                <span>John Due</span>
              </div>
              <div>
                <FiClock />
                <time>4 min</time>
              </div>
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
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    }
  }
  
  return {
    props: {
      post
    },
    revalidate: 60 * 30   // 30 minutos
  }
}
