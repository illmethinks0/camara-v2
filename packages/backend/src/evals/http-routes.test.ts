import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../index.js';
import { camaraStore } from '../services/camaraStore.js';

describe('HTTP Routes - CAMARA', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  beforeEach(() => {
    camaraStore.resetForTests();
  });

  afterAll(async () => {
    await app.close();
  });

  async function login(email: string, password: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    return body.data.tokens.accessToken as string;
  }

  it('serves health endpoint', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
  });

  it('returns seeded courses', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/courses' });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data.courses.length).toBeGreaterThanOrEqual(1);
  });

  it('enforces admin dashboard RBAC', async () => {
    const participantToken = await login('participant1@camara-menorca.es', 'CamaraMenorca2025');

    const forbidden = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboards/admin',
      headers: { Authorization: `Bearer ${participantToken}` },
    });

    expect(forbidden.statusCode).toBe(403);

    const adminToken = await login('admin@camara-menorca.es', 'CamaraMenorca2025');
    const allowed = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboards/admin',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(allowed.statusCode).toBe(200);
    const payload = JSON.parse(allowed.body);
    expect(payload.data.totals.participants).toBe(5);
  });

  it('scopes participant list for instructor assignments', async () => {
    const instructorToken = await login('instructor1@camara-menorca.es', 'CamaraMenorca2025');

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/participants',
      headers: { Authorization: `Bearer ${instructorToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data.participants.length).toBe(3);

    const names = body.data.participants.map((entry: any) => entry.fullName);
    expect(names).toContain('Miguel Sanchez Vega');
    expect(names).not.toContain('David Hernandez Cruz');
  });

  it('blocks participant access to another participant record', async () => {
    const participantToken = await login('participant1@camara-menorca.es', 'CamaraMenorca2025');

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/participants/participant-laura',
      headers: { Authorization: `Bearer ${participantToken}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it('enforces phase progression rule: requires signed annex unless override', async () => {
    const instructorToken = await login('instructor1@camara-menorca.es', 'CamaraMenorca2025');

    const blocked = await app.inject({
      method: 'POST',
      url: '/api/v1/participants/participant-miguel/phase/progress',
      headers: { Authorization: `Bearer ${instructorToken}` },
      payload: { override: false },
    });

    expect(blocked.statusCode).toBe(422);

    const adminToken = await login('admin@camara-menorca.es', 'CamaraMenorca2025');
    const forced = await app.inject({
      method: 'POST',
      url: '/api/v1/participants/participant-miguel/phase/progress',
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { override: true },
    });

    expect(forced.statusCode).toBe(200);
  });

  it('supports annex signature flow and batch export zip', async () => {
    const adminToken = await login('admin@camara-menorca.es', 'CamaraMenorca2025');
    const participantToken = await login('participant1@camara-menorca.es', 'CamaraMenorca2025');
    const instructorToken = await login('instructor1@camara-menorca.es', 'CamaraMenorca2025');

    const generated = await app.inject({
      method: 'POST',
      url: '/api/v1/participants/participant-miguel/annexes/generate',
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { type: 2 },
    });

    expect([200, 201]).toContain(generated.statusCode);
    const generatedBody = JSON.parse(generated.body);
    const annexId = generatedBody.data.annex.id as string;

    const participantSign = await app.inject({
      method: 'POST',
      url: `/api/v1/annexes/${annexId}/signatures`,
      headers: { Authorization: `Bearer ${participantToken}` },
      payload: { typedName: 'Miguel Sanchez Vega' },
    });

    expect(participantSign.statusCode).toBe(201);

    const instructorSign = await app.inject({
      method: 'POST',
      url: `/api/v1/annexes/${annexId}/signatures`,
      headers: { Authorization: `Bearer ${instructorToken}` },
      payload: { typedName: 'Carlos Martinez Lopez' },
    });

    expect(instructorSign.statusCode).toBe(201);

    const download = await app.inject({
      method: 'GET',
      url: `/api/v1/annexes/${annexId}/download`,
      headers: { Authorization: `Bearer ${participantToken}` },
    });

    expect(download.statusCode).toBe(200);
    expect(download.headers['content-type']).toContain('application/pdf');

    const exportZip = await app.inject({
      method: 'POST',
      url: '/api/v1/annexes/batch-export',
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        participantIds: ['participant-miguel', 'participant-laura'],
        signedOnly: true,
      },
    });

    expect(exportZip.statusCode).toBe(200);
    expect(exportZip.headers['content-type']).toContain('application/zip');
    expect(exportZip.body.slice(0, 2)).toBe('PK');
  });
});
