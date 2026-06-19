import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TrainerFeed: React.FC = () => {
  const { feedPosts, handleCreatePost, handleDeletePost } = useAppState();
  const [content, setContent] = useState('');

  const onPost = () => {
    if (!content.trim()) return;
    handleCreatePost(content.trim());
    setContent('');
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 p-5">
        <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 mb-3">New Announcement</h3>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          placeholder="Share a schedule update, reminder, or announcement with your clients..."
          className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={onPost}
            disabled={!content.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-light hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
          >
            Post
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 mb-3">Posted</h3>
        {feedPosts.length === 0 ? (
          <p className="text-sm font-light text-gray-400">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {feedPosts.map(post => (
              <div key={post.id} className="border border-gray-200 p-4">
                <p className="text-sm font-light text-gray-700 leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs font-light text-gray-400">
                    <span>{relativeTime(post.createdAt)}</span>
                    <span>♥ {post.likes.length}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-xs font-light text-gray-300 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                {post.comments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                    {post.comments.map(c => (
                      <div key={c.id} className="pl-2 border-l border-gray-200">
                        <span className="text-xs font-light text-gray-500">{c.memberName} </span>
                        <span className="text-xs font-light text-gray-700">{c.text}</span>
                        <span className="text-[10px] font-light text-gray-300 ml-2">{relativeTime(c.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerFeed;
