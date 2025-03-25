import axios from 'axios';

export const login = async (username: string, passwordhash: string) => {
  try {
    const response = await axios.post("https://localhost:7048/api/auth/login", {
      username,
      passwordhash
    });

    return {
      success: true,
      token: response.data.token,
      refreshToken: response.data.refreshToken, // Eğer refresh token varsa
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Bir hata oluştu!",
    };
  }
};

export const getUserInfo = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Token bulunamadı!');
    }

    const response = await fetch('https://localhost:7048/api/auth/user-info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcı bilgileri alınamadı!');
    }

    return data;
  } catch (error: any) {
    console.error('Hata:', error.message);
    throw new Error(error.message || 'Bir hata oluştu!');
  }
};

