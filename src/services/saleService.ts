import axios from "axios";

const API_URL = "https://localhost:7048/api/sale";

interface SaleData {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  saleDate?: string;
  invoiceId?: number;
}

const saleService = {

  getSales: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Satışları çekerken hata oluştu:", error);
      throw error;
    }
  },

/*  addSale: async (saleData: SaleData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Satış eklerken hata oluştu:", error);
      throw error;
    }
  }, */

  updateSale: async (id: number, saleData: SaleData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Satış güncellerken hata oluştu:", error);
      throw error;
    }
  },

  deleteSale: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Satış silerken hata oluştu:", error);
      throw error;
    }
  },
};

export default saleService;
