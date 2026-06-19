import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import type { FeedPost } from '../../types';

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

const PostCard: React.FC<{ post: FeedPost }> = ({ post }) => {
  const { currentUser, handleLikePost, handleAddComment } = useAppState();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const memberId = currentUser && 'email' in currentUser ? currentUser.id : null;
  const liked = memberId !== null && post.likes.includes(memberId);

  const submitComment = () => {
    if (!commentText.trim()) return;
    handleAddComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  return (
    <div className="border-b border-gray-100 px-4 py-4">
      <p className="text-xs font-light text-gray-700 leading-relaxed">{post.content}</p>
      <p className="text-[10px] font-light text-gray-300 mt-2">{relativeTime(post.createdAt)}</p>

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => handleLikePost(post.id)}
          className={`flex items-center gap-1 text-[11px] font-light transition-colors ${liked ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <span>{liked ? '♥' : '♡'}</span>
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1 text-[11px] font-light text-gray-300 hover:text-gray-500 transition-colors"
        >
          <span>💬</span>
          {post.comments.length > 0 && <span>{post.comments.length}</span>}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2">
          {post.comments.map(c => (
            <div key={c.id} className="pl-2 border-l border-gray-100">
              <span className="text-[10px] font-light text-gray-500">{c.memberName} </span>
              <span className="text-[10px] font-light text-gray-700">{c.text}</span>
            </div>
          ))}
          <div className="flex gap-1 pt-1">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              className="flex-1 text-[11px] font-light border border-gray-200 px-2 py-1 focus:outline-none focus:border-gray-400 min-w-0"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="text-[11px] font-light px-2 py-1 bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FeedSidebar: React.FC = () => {
  const { feedPosts } = useAppState();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <p className="text-xs font-light uppercase tracking-widest text-gray-400">Updates</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {feedPosts.length === 0 ? (
          <p className="px-4 py-6 text-xs font-light text-gray-300">No updates yet.</p>
        ) : (
          feedPosts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default FeedSidebar;
