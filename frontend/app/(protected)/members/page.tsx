'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import client from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { getErrorMessage } from '@/utils/httpError';

interface Member {
  id: number;
  username: string;
  name: string;
  role: string;
}

type ViewState = 'loading' | 'success' | 'empty' | 'error';

export default function MembersListPage() {
  const { role } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const isAdmin = role === 'ADMIN';
  const isMember = role === 'MEMBER';

  const tableRows = useMemo(() => members, [members]);

  const loadMembers = async () => {
    setViewState('loading');
    setErrorMessage('');
    try {
      const [membersResponse, meResponse] = await Promise.all([
        client.get<Member[]>('/members'),
        client.get<Member>('/members/me'),
      ]);
      setMembers(membersResponse.data);
      setCurrentMemberId(meResponse.data.id);
      setViewState(membersResponse.data.length === 0 ? 'empty' : 'success');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load members'));
      setViewState('error');
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const handleDelete = async (memberId: number) => {
    if (!isAdmin) {
      return;
    }

    try {
      await client.delete(`/members/${memberId}`);
      const nextMembers = members.filter((member) => member.id !== memberId);
      setMembers(nextMembers);
      setViewState(nextMembers.length === 0 ? 'empty' : 'success');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to delete member'));
      setViewState('error');
    }
  };

  const renderStatePanel = () => {
    if (viewState === 'loading') {
      return <p className="state-loading">Loading...</p>;
    }
    if (viewState === 'empty') {
      return <p className="state-empty">No data</p>;
    }
    if (viewState === 'error') {
      return (
        <div className="state-error-box">
          <p className="state-error">{errorMessage}</p>
          <button className="btn secondary" onClick={loadMembers} type="button">
            Retry
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Members</h2>
        {isAdmin && (
          <Link className="btn primary" href="/members/new">
            Create Member
          </Link>
        )}
      </div>

      {viewState !== 'success' ? (
        renderStatePanel()
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((member) => {
                const canMemberUseButtons =
                  isMember && currentMemberId === member.id;
                return (
                  <tr key={member.id}>
                    <td>{member.id}</td>
                    <td>{member.username}</td>
                    <td>{member.name || '-'}</td>
                    <td>{member.role}</td>
                    <td>
                      <div className="action-group">
                        {isAdmin && (
                          <>
                            <Link
                              className="btn secondary small"
                              href={`/members/${member.id}`}
                            >
                              Detail
                            </Link>
                            <Link
                              className="btn secondary small"
                              href={`/members/${member.id}?mode=edit`}
                            >
                              Edit
                            </Link>
                            <button
                              className="btn danger small"
                              onClick={() => void handleDelete(member.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {canMemberUseButtons && (
                          <>
                            <Link
                              className="btn secondary small"
                              href="/members/me"
                            >
                              Detail
                            </Link>
                            <Link
                              className="btn secondary small"
                              href="/members/me?mode=edit"
                            >
                              Edit
                            </Link>
                          </>
                        )}
                        {!isAdmin && !canMemberUseButtons && (
                          <span className="muted">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
