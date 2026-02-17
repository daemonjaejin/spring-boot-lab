'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import client from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { getErrorMessage } from '@/utils/httpError';

interface RegisteredApp {
  id: number;
  name: string;
  description: string;
  version: string;
}

interface AppForm {
  name: string;
  description: string;
  version: string;
}

type ViewState = 'loading' | 'ready' | 'error';

const emptyForm: AppForm = {
  name: '',
  description: '',
  version: '',
};

export default function RegisteredAppDetailPage() {
  const router = useRouter();
  const { role } = useAuth();
  const params = useParams();
  const appId = params.appId as string;
  
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [form, setForm] = useState<AppForm>(emptyForm);
  const [resolvedAppId, setResolvedAppId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = role === 'ADMIN';
  const isCreate = appId === 'new';
  const canEdit = useMemo(() => isAdmin, [isAdmin]);

  useEffect(() => {
      if (isCreate && !isAdmin) {
          router.replace('/forbidden');
      }
  }, [isCreate, isAdmin, router]);

  useEffect(() => {
    const loadDetail = async () => {
      setViewState('loading');
      setErrorMessage('');
      setNoticeMessage('');

      if (isCreate) {
        setForm(emptyForm);
        setResolvedAppId(null);
        setViewState('ready');
        return;
      }

      try {
        if (!appId) {
          throw new Error('Invalid app route');
        }

        const response = await client.get<RegisteredApp>(`/apps/${appId}`);
        const app = response.data;
        setResolvedAppId(app.id);
        setForm({
          name: app.name || '',
          description: app.description || '',
          version: app.version || '',
        });
        setViewState('ready');
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Failed to load app detail'));
        setViewState('error');
      }
    };

    void loadDetail();
  }, [appId, isCreate]);

  if (viewState === 'loading') {
    return (
      <section className="page-card">
        <h2>App Detail</h2>
        <p className="state-loading">Loading...</p>
      </section>
    );
  }

  if (viewState === 'error') {
    return (
      <section className="page-card">
        <h2>App Detail</h2>
        <p className="state-error">{errorMessage}</p>
        <Link className="btn secondary" href="/apps">
          Back to Apps
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
        const response = await client.post<RegisteredApp>('/apps', form);
        setNoticeMessage('App created successfully.');
        router.replace(`/apps/${response.data.id}`);
      } else {
        const targetId = resolvedAppId ?? Number(appId);
        await client.put(`/apps/${targetId}`, form);
        setNoticeMessage('App updated successfully.');
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to save app'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>{isCreate ? 'Create App' : 'App Detail'}</h2>
        <Link className="btn secondary" href="/apps">
          Back
        </Link>
      </div>

      {noticeMessage && <p className="state-success">{noticeMessage}</p>}
      {errorMessage && <p className="state-error">{errorMessage}</p>}

      <form className="form-grid" onSubmit={submit}>
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
          <span>Version</span>
          <input
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            required={canEdit}
            value={form.version}
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            className="textarea"
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            value={form.description}
          />
        </label>

        {canEdit && (
          <button className="btn primary" disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </form>
    </section>
  );
}
