'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import client from '@/api/client';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  children: Comment[];
  likeCount: number;
  dislikeCount: number;
  myReaction: 'LIKE' | 'DISLIKE' | null;
  parentId?: number | null;
}

interface Board {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  comments: Comment[];
  likeCount: number;
  dislikeCount: number;
  myReaction: 'LIKE' | 'DISLIKE' | null;
}

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  const { username } = useAuth();
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBoard = async () => {
    try {
      const res = await client.get<Board>(`/boards/${params.id}`);
      setBoard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardReaction = async (type: 'LIKE' | 'DISLIKE') => {
    try {
      await client.post(`/boards/${params.id}/reaction`, null, { params: { type } });
      fetchBoard();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [params.id]);

  const handleDeleteBoard = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/boards/${params.id}`);
      router.push('/board');
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEditBoard = () => {
    router.push(`/board/edit/${params.id}`);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/comments/${commentId}`);
      fetchBoard();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!board) return <div style={{ padding: '2rem' }}>Board not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => router.push('/board')} style={{ marginBottom: '20px', cursor: 'pointer' }}>&larr; 목록으로</button>
      
      <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1>{board.title}</h1>
          {username === board.author && (
            <div className="board-actions" style={{ display: 'flex', gap: '8px' }}>
              <button className="btn secondary" onClick={handleEditBoard} style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
              <button className="btn danger" onClick={handleDeleteBoard} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
            </div>
          )}
        </div>
        <div style={{ color: '#666', marginBottom: '20px' }}>
          <span>{board.author}</span> | <span>{new Date(board.createdAt).toLocaleString()}</span>
        </div>
        <div 
          className="content-body"
          dangerouslySetInnerHTML={{ __html: board.content }} 
          style={{ minHeight: '200px', marginBottom: '30px' }}
        />

        {/* Board Reaction Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => handleBoardReaction('LIKE')}
            style={{ 
              padding: '10px 20px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer',
              backgroundColor: board.myReaction === 'LIKE' ? '#e1f5fe' : '#fff',
              borderColor: board.myReaction === 'LIKE' ? '#03a9f4' : '#ddd'
            }}
          >
            👍 {board.likeCount}
          </button>
          <button 
            onClick={() => handleBoardReaction('DISLIKE')}
            style={{ 
              padding: '10px 20px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer',
              backgroundColor: board.myReaction === 'DISLIKE' ? '#ffebee' : '#fff',
              borderColor: board.myReaction === 'DISLIKE' ? '#f44336' : '#ddd'
            }}
          >
            👎 {board.dislikeCount}
          </button>
        </div>
      </div>

      <CommentSection 
        boardId={board.id} 
        comments={board.comments} 
        onCommentAdded={fetchBoard} 
        username={username}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
}

function CommentSection({ 
  comments, 
  boardId, 
  onCommentAdded,
  username,
  onDeleteComment 
}: { 
  comments: Comment[]; 
  boardId: number; 
  onCommentAdded: () => void;
  username: string | null;
  onDeleteComment: (id: number) => void;
}) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await client.post('/comments', {
        content: newComment,
        boardId,
        parentId: replyTo,
      });
      setNewComment('');
      setReplyTo(null);
      onCommentAdded();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleReaction = async (commentId: number, type: 'LIKE' | 'DISLIKE') => {
    try {
      await client.post(`/comments/${commentId}/reaction`, null, { params: { type } });
      onCommentAdded();
    } catch (error) {
      console.error('Failed to react to comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <h3>댓글 {comments.length}</h3>
      
      {/* Root Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'} 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button 
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          등록
        </button>
        {replyTo && (
           <button type="button" onClick={() => setReplyTo(null)} style={{ padding: '10px', background: '#eee', border: 'none', borderRadius: '4px' }}>취소</button>
        )}
      </form>

      {/* Comment List */}
      <div>
        {comments?.filter(c => !c.parentId).map(comment => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            boardId={boardId} 
            onReply={() => setReplyTo(comment.id)} 
            onReaction={handleReaction} 
            username={username}
            onDeleteComment={onDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({ 
  comment, 
  boardId, 
  onReply, 
  onReaction,
  username,
  onDeleteComment
}: { 
  comment: Comment, 
  boardId: number, 
  onReply: () => void, 
  onReaction: (id: number, type: 'LIKE' | 'DISLIKE') => void,
  username: string | null,
  onDeleteComment: (id: number) => void
}) {
  return (
    <div style={{ borderLeft: '1px solid #eee', paddingLeft: '15px', marginBottom: '15px' }}>
      <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{comment.author}</p>
          {username === comment.author && (
            <button 
              onClick={() => onDeleteComment(comment.id)}
              style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold' }}
              title="삭제"
            >
              X
            </button>
          )}
        </div>
        <p style={{ margin: '0 0 10px 0' }}>{comment.content}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <div style={{ color: '#666' }}>
            {new Date(comment.createdAt).toLocaleString()}
            <button 
              onClick={onReply} 
              style={{ marginLeft: '10px', border: 'none', background: 'none', color: '#0070f3', cursor: 'pointer' }}
            >
              답글 달기
            </button>
          </div>
          
          {/* Comment Reaction Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => onReaction(comment.id, 'LIKE')}
              style={{ 
                border: '1px solid #eee', borderRadius: '12px', padding: '2px 8px', cursor: 'pointer',
                backgroundColor: comment.myReaction === 'LIKE' ? '#e1f5fe' : '#fff',
                borderColor: comment.myReaction === 'LIKE' ? '#03a9f4' : '#eee'
              }}
            >
              👍 {comment.likeCount}
            </button>
            <button 
              onClick={() => onReaction(comment.id, 'DISLIKE')}
              style={{ 
                border: '1px solid #eee', borderRadius: '12px', padding: '2px 8px', cursor: 'pointer',
                backgroundColor: comment.myReaction === 'DISLIKE' ? '#ffebee' : '#fff',
                borderColor: comment.myReaction === 'DISLIKE' ? '#f44336' : '#eee'
              }}
            >
              👎 {comment.dislikeCount}
            </button>
          </div>
        </div>
      </div>

      {/* Nested Children */}
      {comment.children && comment.children.length > 0 && (
        <div style={{ marginTop: '10px', marginLeft: '10px' }}>
          {comment.children.map(child => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              boardId={boardId} 
              onReply={() => onReply()} 
              onReaction={onReaction}
              username={username}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
