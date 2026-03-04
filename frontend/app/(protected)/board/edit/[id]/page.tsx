'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import client from '@/api/client';

const RichEditor = dynamic(() => import('@/components/common/RichEditor'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>에디터를 불러오는 중...</div>
});

export default function BoardEditPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await client.get(`/boards/${params.id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        console.error('Failed to fetch board:', err);
        alert('글 정보를 불러오는데 실패했습니다.');
        router.push('/board');
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert('제목과 내용을 입력해주세요.');

    setSubmitting(true);
    try {
      const res = await client.put(`/boards/${params.id}`, { title, content });

      if (res.status === 200 || res.status === 201) {
        router.push(`/board/${params.id}`);
      } else {
        alert('글 수정 실패');
      }
    } catch (err) {
      console.error('Board edit error:', err);
      alert('오류 발생');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>글 수정 (Edit)</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
            placeholder="제목을 입력하세요"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>내용</label>
          <RichEditor 
            value={content} 
            onChange={(newContent) => setContent(newContent)} 
            placeholder="내용을 입력하세요"
          />
        </div>

        <div style={{ marginTop: '50px', textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
