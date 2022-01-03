import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';
import formatShorDate from '../Utils/formatToShortDate';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';


interface Post {
  slug: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  author: string;
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps ) {
  const [ nextPage, setNextPage ] = useState<string>(postsPagination.next_page);
  const [ posts, setPosts] = useState<Post[]>(postsPagination.results);
  
  const getMorePosts = () => {
    if(!nextPage) return;
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        data.results.map(post => {
          setPosts(oldPosts => [
            ...oldPosts,
            {
              slug: post.uid,
              title: post.data.title,
              subtitle: post.data.subtitle,
              updatedAt: formatShorDate(post.last_publication_date),
              author: post.data.author
            }
          ])
        })
        setNextPage(data.next_page);
      })
  }

  return (
    <>
      <div className={styles.homeHeaderContainer}>
        <Header />
      </div>

      <main className={styles.homeContainer}>
        { posts.map(post => (
          <section key={post.slug} className={styles.homePostItemList}>
            <Link href={`/post/${post.slug}`}>
              <a>
                <h1>{post.title}</h1>
                <p>{post.subtitle}</p>
                <div className={styles.info}>
                  <div>
                    <FiCalendar />
                    <time>{post.updatedAt}</time>
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          </section>
        ))}

        {!!nextPage && (
          <button disabled={!nextPage} onClick={getMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}


export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // Get 2 posts on prismic cms
  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],{
    fetch: ['post.title', 'post.subtitle', 'post.content','post.author'],
    pageSize: 2,
  });

  // Creates the post objects with only the required items
  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      subtitle: post.data.subtitle,
      updatedAt: formatShorDate(post.last_publication_date),
      author: post.data.author,
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts
      }
    }
  }
};
