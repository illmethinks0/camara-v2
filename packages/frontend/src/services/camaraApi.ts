/**
 * CAMARA v2 API Client
 */

import type {
  APIResult,
  AnnexDTO,
  BatchExportRequest,
  CourseDTO,
  CreateParticipantRequest,
  FileDownload,
  LoginRequest,
  LoginResponse,
  MarkAttendanceRequest,
  ParticipantDTO,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  SignatureDTO,
  User,
} from '../types/camara';

const API_BASE_URL = '/api/v1';

const getAccessToken = (): string | null => localStorage.getItem('accessToken');
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const createHeaders = (includeAuth = false, includeJsonContentType = true): HeadersInit => {
  const headers: HeadersInit = {};

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const parseJsonResponse = async <T>(response: Response): Promise<APIResult<T>> => {
  try {
    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: payload.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Error desconocido',
          recoverability: 'terminal',
        },
      };
    }

    return {
      success: true,
      data: (payload.data ?? payload) as T,
    };
  } catch {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'No se pudo procesar la respuesta del servidor',
        recoverability: 'terminal',
      },
    };
  }
};

const handleNetworkError = (): APIResult<never> => ({
  success: false,
  error: {
    code: 'NETWORK_ERROR',
    message: 'Error de conexion. Intentalo de nuevo.',
    recoverability: 'retryable',
  },
});

const parseContentDispositionFileName = (value: string | null): string | undefined => {
  if (!value) return undefined;

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const quotedMatch = value.match(/filename=\"([^\"]+)\"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const simpleMatch = value.match(/filename=([^;]+)/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1].trim();
  }

  return undefined;
};

async function requestJson<T>(
  path: string,
  options: RequestInit,
  includeAuth = true
): Promise<APIResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...createHeaders(includeAuth, true),
        ...(options.headers || {}),
      },
    });

    return await parseJsonResponse<T>(response);
  } catch {
    return handleNetworkError();
  }
}

async function requestFile(
  path: string,
  options: RequestInit,
  fallbackFileName: string,
  includeAuth = true
): Promise<APIResult<FileDownload>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...createHeaders(includeAuth, false),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      return await parseJsonResponse(response);
    }

    const blob = await response.blob();
    const fileName =
      parseContentDispositionFileName(response.headers.get('content-disposition')) ?? fallbackFileName;

    return {
      success: true,
      data: {
        fileName,
        blob,
      },
    };
  } catch {
    return handleNetworkError();
  }
}

export const register = async (request: RegisterRequest): Promise<APIResult<RegisterResponse>> => {
  const result = await requestJson<RegisterResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    false
  );

  if (result.success && result.data?.tokens) {
    setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
  }

  return result;
};

export const login = async (request: LoginRequest): Promise<APIResult<LoginResponse>> => {
  const result = await requestJson<LoginResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    false
  );

  if (result.success && result.data?.tokens) {
    setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
  }

  return result;
};

export const refreshToken = async (): Promise<APIResult<RefreshTokenResponse>> => {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return {
      success: false,
      error: {
        code: 'NO_REFRESH_TOKEN',
        message: 'No hay token de refresco disponible',
        recoverability: 'terminal',
      },
    };
  }

  const result = await requestJson<RefreshTokenResponse>(
    '/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refresh }),
    },
    false
  );

  if (result.success && result.data) {
    setTokens(result.data.accessToken, result.data.refreshToken);
  } else {
    clearTokens();
  }

  return result;
};

export const logout = async (): Promise<APIResult<void>> => {
  await requestJson<{ success: boolean }>(
    '/auth/logout',
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken: getRefreshToken() ?? '' }),
    },
    true
  );

  clearTokens();
  return { success: true };
};

export const getMe = async (): Promise<APIResult<{ user: User }>> => {
  return requestJson<{ user: User }>(
    '/auth/me',
    {
      method: 'GET',
    },
    true
  );
};

export const getCourses = async (): Promise<APIResult<{ courses: CourseDTO[] }>> => {
  return requestJson<{ courses: CourseDTO[] }>(
    '/courses',
    {
      method: 'GET',
    },
    false
  );
};

export const getParticipants = async (): Promise<APIResult<{ participants: ParticipantDTO[] }>> => {
  return requestJson<{ participants: ParticipantDTO[] }>(
    '/participants',
    {
      method: 'GET',
    },
    true
  );
};

export const createParticipant = async (
  request: CreateParticipantRequest
): Promise<APIResult<{ participant: ParticipantDTO }>> => {
  return requestJson<{ participant: ParticipantDTO }>(
    '/participants',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true
  );
};

export const getParticipant = async (
  participantId: string
): Promise<APIResult<{ participant: ParticipantDTO }>> => {
  return requestJson<{ participant: ParticipantDTO }>(
    `/participants/${participantId}`,
    {
      method: 'GET',
    },
    true
  );
};

export const generateAnnex = async (
  participantId: string,
  type?: 2 | 3 | 5
): Promise<APIResult<{ annex: AnnexDTO }>> => {
  return requestJson<{ annex: AnnexDTO }>(
    `/participants/${participantId}/annexes/generate`,
    {
      method: 'POST',
      body: JSON.stringify(type ? { type } : {}),
    },
    true
  );
};

export const getParticipantAnnexes = async (
  participantId: string
): Promise<APIResult<{ annexes: AnnexDTO[] }>> => {
  return requestJson<{ annexes: AnnexDTO[] }>(
    `/participants/${participantId}/annexes`,
    {
      method: 'GET',
    },
    true
  );
};

export const signAnnex = async (
  annexId: string,
  typedName: string
): Promise<APIResult<{ signature: SignatureDTO }>> => {
  return requestJson<{ signature: SignatureDTO }>(
    `/annexes/${annexId}/signatures`,
    {
      method: 'POST',
      body: JSON.stringify({ typedName }),
    },
    true
  );
};

export const progressPhase = async (
  participantId: string,
  override = false
): Promise<APIResult<{ participantId: string; currentPhase: string }>> => {
  return requestJson<{ participantId: string; currentPhase: string }>(
    `/participants/${participantId}/phase/progress`,
    {
      method: 'POST',
      body: JSON.stringify({ override }),
    },
    true
  );
};

export const markAttendance = async (
  participantId: string,
  payload: MarkAttendanceRequest
): Promise<APIResult<{ attendance: unknown }>> => {
  return requestJson<{ attendance: unknown }>(
    `/participants/${participantId}/attendance`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true
  );
};

export const isAuthenticated = (): boolean => Boolean(getAccessToken());

export const annexDownloadUrl = (annexId: string): string => `${API_BASE_URL}/annexes/${annexId}/download`;

export const downloadAnnex = async (annexId: string): Promise<APIResult<FileDownload>> => {
  return requestFile(`/annexes/${annexId}/download`, { method: 'GET' }, `anexo-${annexId}.pdf`, true);
};

export const batchExportAnnexes = async (
  payload: BatchExportRequest
): Promise<APIResult<FileDownload>> => {
  return requestFile(
    '/annexes/batch-export',
    {
      method: 'POST',
      headers: createHeaders(true, true),
      body: JSON.stringify(payload),
    },
    'anexos-export.zip',
    true
  );
};
