import axios from "axios";

const API_URL = "https://localhost:7048/api/customer";

const customerService = {

  getCustomers: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Müşterileri çekerken hata oluştu:", error);
      throw error;
    }
  },

  addCustomer: async (customerData: { name: string; email: string; phoneNumber: string; address: string; taxNumber: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, customerData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Müşteri eklerken hata oluştu:", error);
      throw error;
    }
  },

  updateCustomer: async (id: number, customerData: { name: string; email: string; phoneNumber: string; address: string; taxNumber: string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, customerData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Müşteri güncellerken hata oluştu:", error);
      throw error;
    }
  },

  deleteCustomer: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Müşteri silerken hata oluştu:", error);
      throw error;
    }
  },
};

export default customerService;
