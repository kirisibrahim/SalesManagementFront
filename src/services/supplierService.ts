import axios from "axios";
const API_URL = "https://localhost:7048/api/supplier";

const supplierService = {

  getSuppliers: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Tedarikçileri çekerken hata oluştu:", error);
      throw error;
    }
  },

  addSupplier: async (supplierData: { name: string; contactInfo: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, supplierData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Tedarikçi eklerken hata oluştu:", error);
      throw error;
    }
  },

  updateSupplier: async (id: number, supplierData: { name: string; contactInfo: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, supplierData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Tedarikçi güncellerken hata oluştu:", error);
      throw error;
    }
  },

  deleteSupplier: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Tedarikçi silerken hata oluştu:", error);
      throw error;
    }
  },
};

export default supplierService;
