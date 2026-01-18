/**
 * Auth Client untuk SIKP Backend
 * 
 * Menangani authentication dengan backend Hono API
 * API: POST /api/auth/login, POST /api/auth/register/mahasiswa, etc.
 */

const API_BASE_URL = import.meta.env.VITE_APP_AUTH_URL || 'http://localhost:8787';

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
  return localStorage.getItem('auth_token');
}

/**
 * Check apakah user sudah login
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
