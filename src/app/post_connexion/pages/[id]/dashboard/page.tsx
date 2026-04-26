'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { storage } from '@/utils/storage';
import { Page, Post as ThreadlyPost } from '@/types/threadly';
import type { Post as ApiPost, User as ApiUser, Media as ApiMedia } from '@lib/types/api.types';
import Homee from '@/features/post_connexion/Accueils/components/Homee';
import { BarChart, Users, FileText, Settings } from 'lucide-react';
import EditPageModal from '@/features/post_connexion/pages/components/EditPageModal';
import CreatePostModal from '@/features/post_connexion/Accueils/components/CreatePostModal';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';

export default function PageDashboard() {
  const params = useParams();
  const { id } = params;
  const [page, setPage] = useState<Page | null>(null);
  const [stats, setStats] = useState({ publications: 0, interactions: 0 });
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [loading, setLoading] = useState(true);

  const mapThreadlyPostToApiPost = (post: ThreadlyPost): ApiPost => {
    const [firstName, ...rest] = (post.authorName || 'Utilisateur').trim().split(' ');
    const lastName = rest.join(' ');

    const author: ApiUser = {
      id: post.authorId || post.id,
      email: '',
      first_name: firstName || 'Utilisateur',
      last_name: lastName || '',
      avatar: post.authorAvatar,
      profile_picture_url: post.authorAvatar,
    };

    const media: ApiMedia[] | undefined = post.media?.length
      ? post.media.map((url) => ({ type: 'IMAGE', url }))
      : undefined;

    return {
      id: post.id,
      author,
      content: post.content,
      media,
      likes_count: post.likes,
      comments_count: post.comments,
      shares_count: post.shares,
      created_at: new Date(post.timestamp).toISOString(),
    };
  };

  const handlePageUpdated = (updatedPage: Page) => {
    setPage(updatedPage);
    // Also update the list of all pages in storage
    const updatePagesInStorage = async () => {
      const pagesData = await storage.get('user_pages');
      if (pagesData && pagesData.value) {
        let allPages: Page[] = JSON.parse(pagesData.value);
        allPages = allPages.map(p => p.id === updatedPage.id ? updatedPage : p);
        await storage.set('user_pages', JSON.stringify(allPages));
      }
    };
    updatePagesInStorage();
  };

  const handlePostCreated = (post: any) => {
    const apiPost: ApiPost = (post && post.author && post.likes_count !== undefined)
      ? (post as ApiPost)
      : mapThreadlyPostToApiPost(post as ThreadlyPost);

    const newPosts = [apiPost, ...posts];
    setPosts(newPosts);

    const totalInteractions = newPosts.reduce(
      (acc, p) => acc + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0),
      0
    );
    setStats({
      publications: newPosts.length,
      interactions: totalInteractions,
    });
  };

  useEffect(() => {
    const fetchPage = async () => {
      if (id) {
        const pagesData = await storage.get('user_pages');
        if (pagesData && pagesData.value) {
          const allPages: Page[] = JSON.parse(pagesData.value);
          const foundPage = allPages.find(p => p.id === id);
          setPage(foundPage || null);

          // Load posts and calculate stats
          const postsData = await storage.get('user_posts');
          if (postsData && postsData.value) {
            const allPosts: ThreadlyPost[] = JSON.parse(postsData.value);
            const pagePosts = allPosts.filter(p => p.pageId === id);
            const mappedPosts = pagePosts.map(mapThreadlyPostToApiPost);
            const totalInteractions = mappedPosts.reduce(
              (acc, post) => acc + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
              0
            );
            setStats({
              publications: mappedPosts.length,
              interactions: totalInteractions,
            });
            setPosts(mappedPosts);
          }
        }
      }
      setLoading(false);
    };
    fetchPage();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Chargement...</p></div>;
  }

  if (!page) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Page introuvable.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord : {page.name}</h1>
            <p className="text-sm text-gray-500">{page.category}</p>
          </div>
          <button 
            onClick={() => setShowEditPage(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Settings size={18} /> Modifier la page
          </button>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Create Post Card */}
          <Card className="mb-8 p-4">
            <div className="flex items-center gap-3">
              <Avatar alt={page.name} src={page.avatarImage || undefined} />
              <button 
                onClick={() => setShowCreatePost(true)}
                className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition"
              >
                Créer une publication pour {page.name}...
              </button>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Abonnés</dt>
                      <dd className="text-lg font-medium text-gray-900">{page.followers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Publications</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.publications}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Interactions</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.interactions}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Publications de la page</h2>
            {posts.length > 0 ? (
              <div className="space-y-4">
                <Homee posts={posts} />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <h3 className="text-lg font-bold">Aucune publication</h3>
                <p className="text-sm text-gray-500 mt-1">Cette page n'a pas encore de publications.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <CreatePostModal 
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
        pageContext={page}
      />

      {showEditPage && page && (
        <EditPageModal 
          isOpen={showEditPage}
          onClose={() => setShowEditPage(false)}
          page={page}
          onPageUpdate={handlePageUpdated}
        />
      )}
    </div>
  );
}
