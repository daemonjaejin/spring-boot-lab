'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import client from '@/api/client';

interface Board {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  commentCount: number;
}

interface PageData {
  content: Board[];
  totalPages: number;
  number: number; // current page index (0-based)
  first: boolean;
  last: boolean;
}

export default function BoardListPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState(0);

  const fetchBoards = async (pageIndex: number) => {
    setLoading(true);
    try {
      const res = await client.get<PageData>(`/boards?page=${pageIndex}`);
      setData(res.data);
      setPage(pageIndex);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards(0);
  }, []);

  const handleDownloadExcel = () => {
    window.location.href = 'http://localhost:8081/api/boards/excel';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>게시판 (Board)</h1>
        <div>
          <button 
            onClick={handleDownloadExcel}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            엑셀 다운로드
          </button>
          <Link href="/board/write" style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            글쓰기
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {data?.content && data.content.length > 0 ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Title</th>
                    <th style={{ padding: '10px' }}>Author</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((board) => (
                    <tr key={board.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{board.id}</td>
                      <td style={{ padding: '10px' }}>
                        <Link href={`/board/${board.id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
                          {board.title}
                        </Link>
                      </td>
                      <td style={{ padding: '10px' }}>{board.author}</td>
                      <td style={{ padding: '10px' }}>{new Date(board.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>{board.commentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                {data && Array.from({ length: data.totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchBoards(i)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      backgroundColor: page === i ? '#0070f3' : 'white',
                      color: page === i ? 'white' : 'black',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '100px 0', 
              color: '#666',
              fontSize: '1.2rem',
              border: '1px dashed #ddd',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              등록된 게시글이 없습니다.
            </div>
          )}
        </>
      )}
    </div>
  );
}
