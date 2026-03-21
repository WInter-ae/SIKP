/**
 * Auth Client untuk SIKP Backend
 * 
 * Menangani authentication dengan backend Hono API
 * API: POST /api/auth/login, POST /api/auth/register/mahasiswa, etc.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_AUTH_URL ||
  'https://backend-sikp.backend-sikp.workers.dev';

/**
 * Login dengan email dan password
 * @param email Email pengguna
 * @param password Kata sandi pengguna
 * @returns User data dan JWT token
 */
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    // Simpan token ke localStorage
    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }

    return {
      success: true,
      user: data.data?.user,
      token: data.data?.token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login gagal',
    };
  }
}

/**
 * Register mahasiswa baru
 */
export async function registerMahasiswa(data: {
  nim: string;
  nama: string;
  email: string;
  password: string;
  phone: string;
  fakultas: string;
  prodi: string;
  semester: number;
  angkatan: string;
}) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register/mahasiswa`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registrasi gagal');
    }

    // Simpan token ke localStorage
    if (result.data?.token) {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user_data', JSON.stringify(result.data.user));
    }

    return {
      success: true,
      user: result.data?.user,
      token: result.data?.token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registrasi gagal',
    };
  }
}

/**
 * Register pembimbing lapangan.
 * Endpoint backend khusus belum tersedia pada workspace ini,
 * jadi fungsi ini mengembalikan pesan terarah agar UI tidak crash.
 */
export async function registerFieldMentor(_data: {
  email: string;
  password: string;
  nama: string;
  nip?: string;
  instansi?: string;
  jabatan?: string;
  no_telepon?: string;
}) {
  return {
    success: false,
    message: 'Endpoint registrasi pembimbing lapangan belum tersedia di backend.',
  };
}

/**
 * Logout dan hapus token
 */
export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
}

/**
 * Get current user dari localStorage
 */
export function getCurrentUser() {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get auth token dari localStorage
 */
export function getAuthToken(): string | null {
  const rawToken = localStorage.getItem('auth_token');
  if (!rawToken) return null;

  const trimmed = rawToken.trim();
  if (!trimmed) return null;

  const lowered = trimmed.toLowerCase();
  if (lowered === 'null' || lowered === 'undefined') return null;

  // Tolerate token stored as JSON string value, e.g. "eyJ..."
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  if (!unquoted) return null;

  // Tolerate token stored with Bearer prefix
  return unquoted.replace(/^Bearer\s+/i, '').trim() || null;
}

/**
 * Check apakah user sudah login
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
