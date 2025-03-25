import axios from "axios";

const API_URL = "https://localhost:7048/api/category";

const categoryService = {

  getCategories: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Kategorileri çekerken hata oluştu:", error);
      throw error;
    }
  },

  addCategory: async (categoryData: { name: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, categoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Kategori eklerken hata oluştu:", error);
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Kategori silerken hata oluştu:", error);
      throw error;
    }
  },

  updateCategory: async (id: number, categoryData: { name: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, categoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Kategori güncellerken hata oluştu:", error);
      throw error;
    }
  },
};

export default categoryService;
