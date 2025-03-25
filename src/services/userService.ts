import axios from "axios";

const API_URL = "https://localhost:7048/api/user";
const APIROLE_URL = "https://localhost:7048/api/role";

const userService = {

  getUsers: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Kullanıcıları çekerken hata oluştu:", error);
      throw error;
    }
  },

  addUser: async (userData: { username: string; passwordHash: string; roleId: number }) => {
    try {
      const token = sessionStorage.getItem("token");
      const formattedUserData = {
        username: userData.username,
        passwordHash: userData.passwordHash,  // Şifreyi hash'lenmiş olarak gönderiyoruz
        roleId: userData.roleId,  // Rol ID'si
        roleName: "" // Backend hata vermesin diye boş string olarak ekledik
      };

      const response = await axios.post(API_URL, formattedUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error("Kullanıcı eklerken hata oluştu:", error);
      throw error;
    }
  },

updateUser: async (id: number, userData: { username: string; passwordHash: string; roleId: number }) => {
  try {
    const token = sessionStorage.getItem("token");
    const formattedUserData = {
      id: id, 
      username: userData.username,
      passwordHash: userData.passwordHash,
      roleId: userData.roleId,  // Rol ID'si
      roleName: "" // Backend hata vermesin diye boş string olarak ekledik
    };
    const response = await axios.put(`${API_URL}/${id}`, formattedUserData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error) {
    console.error("Kullanıcı güncellerken hata oluştu:", error);
    throw error;
  }
},

  deleteUser: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Kullanıcı silerken hata oluştu:", error);
      throw error;
    }
  },

  getRoles: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${APIROLE_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Rolleri çekerken hata oluştu:", error);
      throw error;
    }
  },
};

export default userService;
