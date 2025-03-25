import axios from "axios";

const API_ROLE_URL = "https://localhost:7048/api/role";

const roleService = {

  getRoles: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_ROLE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Rolleri geri döndürüyoruz
    } catch (error) {
      console.error("Rolleri çekerken hata oluştu:", error);
      throw error;
    }
  },

  addRole: async (roleData: { name: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_ROLE_URL, roleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Rol eklerken hata oluştu:", error);
      throw error;
    }
  },

  updateRole: async (id: number, roleData: { name: string }) => {
    try {
      const token = sessionStorage.getItem("token");

      // Backend'in beklediği format
      const formattedRoleData = {
        id: id, // ID'yi burada backend'e gönderiyoruz
        name: roleData.name,
      };

      const response = await axios.put(`${API_ROLE_URL}/${id}`, formattedRoleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error("Rol güncellerken hata oluştu:", error);
      throw error;
    }
  },

  deleteRole: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_ROLE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Rol silerken hata oluştu:", error);
      throw error;
    }
  },
};

export default roleService;
