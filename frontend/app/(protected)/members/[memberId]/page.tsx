'use client';

import Link from 'next/link';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import client from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { getErrorMessage } from '@/utils/httpError';

interface Member {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface MemberForm {
  username: string;
  name: string;
  role: string;
  password: string;
}

type ViewState = 'loading' | 'ready' | 'error';

const emptyForm: MemberForm = {
  username: '',
  name: '',
  role: 'MEMBER',
  password: '',
};

export default function MemberDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAuth();
  const params = useParams();
  const memberId = params.memberId as string;
  const searchParams = useSearchParams();

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [resolvedMemberId, setResolvedMemberId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = role === 'ADMIN';
  const isMember = role === 'MEMBER';
  
  // Logic to determine if it's 'new' or 'me' based on param
  const isCreate = memberId === 'new';
  const isMeRoute = memberId === 'me';
  const isEditMode = searchParams.get('mode') === 'edit';

  const canEdit = useMemo(() => {
    if (isCreate) {
      return isAdmin;
    }
    if (isAdmin) {
      return true;
    }
    return isMember && isMeRoute;
  }, [isAdmin, isCreate, isMember, isMeRoute]);

  useEffect(() => {
    // Permission check
    if (!isAdmin && !isMember) {
      router.replace('/forbidden');
      return;
    }
    if (isMember && !isMeRoute) {
        router.replace('/forbidden');
        return;
    }
  }, [isAdmin, isMember, isMeRoute, router]);

  useEffect(() => {
    const loadDetail = async () => {
      setViewState('loading');
      setErrorMessage('');
      setNoticeMessage('');

      if (isCreate) {
        setForm(emptyForm);
        setResolvedMemberId(null);
        setViewState('ready');
        return;
      }

      try {
        if (!isMeRoute && !memberId) {
            // Should not happen with Next.js routing validation but good to have
           throw new Error('Invalid member route');
        }

        const response = isMeRoute
          ? await client.get<Member>('/members/me')
          : await client.get<Member>(`/members/${memberId}`);
        
        const member = response.data;
        setResolvedMemberId(member.id);
        setForm({
          username: member.username,
          name: member.name || '',
          role: member.role,
          password: '',
        });
        setViewState('ready');
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Failed to load member detail'));
        setViewState('error');
      }
    };

    void loadDetail();
  }, [isCreate, isMeRoute, memberId]);

  if (viewState === 'loading') {
    return (
      <section className="page-card">
        <h2>Member Detail</h2>
        <p className="state-loading">Loading...</p>
      </section>
    );
  }

  if (viewState === 'error') {
    return (
      <section className="page-card">
        <h2>Member Detail</h2>
        <p className="state-error">{errorMessage}</p>
        <Link className="btn secondary" href="/members">
          Back to Members
        </Link>
      </section>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) {
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      if (isCreate) {
        const response = await client.post<Member>('/members', {
          username: form.username,
          password: form.password,
          name: form.name,
          role: form.role,
        });
        setNoticeMessage('Member created successfully.');
        router.replace(`/members/${response.data.id}`);
      } else {
        const targetId = resolvedMemberId ?? (memberId === 'me' ? null : Number(memberId));
        // If targetId is null it means we are 'me' and haven't loaded ID? 
        // loadDetail sets resolvedMemberId, so it should be fine.
        // But let's be safe. 'me' endpoint usually handles it, but PUT usually requires ID.
        // The API client usage in original code:
        // await client.put(`/members/${targetId}`, ...);
        // resolvedMemberId comes from response.data.id.
        
        if (!targetId) {
             throw new Error("Member ID missing");
        }

        await client.put(`/members/${targetId}`, {
          username: form.username,
          password: form.password,
          name: form.name,
          role: form.role,
        });
        setNoticeMessage('Member saved successfully.');
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to save member'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>{isCreate ? 'Create Member' : 'Member Detail'}</h2>
        <Link className="btn secondary" href="/members">
          Back
        </Link>
      </div>

      {noticeMessage && <p className="state-success">{noticeMessage}</p>}
      {errorMessage && <p className="state-error">{errorMessage}</p>}

      <form className="form-grid" onSubmit={submit}>
        <label className="field">
          <span>Username</span>
          <input
            disabled={!isAdmin || !isCreate}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            value={form.username}
          />
        </label>
        <label className="field">
          <span>Name</span>
          <input
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required={canEdit}
            value={form.name}
          />
        </label>
        <label className="field">
          <span>Role</span>
          <select
            disabled={!isAdmin}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            value={form.role}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="MEMBER">MEMBER</option>
            <option value="TESTER">TESTER</option>
          </select>
        </label>
        <label className="field">
          <span>Password {isCreate ? '(required)' : '(optional)'}</span>
          <input
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={isCreate}
            type="password"
            value={form.password}
          />
        </label>

        {canEdit && (
          <button className="btn primary" disabled={saving} type="submit">
            {saving ? 'Saving...' : isEditMode || isCreate ? 'Save' : 'Update'}
          </button>
        )}
      </form>
    </section>
  );
}
