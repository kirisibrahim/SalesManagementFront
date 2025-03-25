import axios from "axios";

const API_URL = "https://localhost:7048/api/invoice";

interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  totalAmount: number;
}

const invoiceService = {
  // Tüm faturaları çekme
  getInvoices: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Faturaları çekerken hata oluştu:", error);
      throw error;
    }
  },

  getInvoiceById: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Fatura çekilirken hata oluştu:", error);
      throw error;
    }
  },

  createInvoice: async (invoiceData: InvoiceData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, invoiceData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Fatura eklerken hata oluştu:", error);
      throw error;
    }
  },

  updateInvoice: async (id: number, invoiceData: InvoiceData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Fatura güncellenirken hata oluştu:", error);
      throw error;
    }
  },

  deleteInvoice: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Fatura silinirken hata oluştu:", error);
      throw error;
    }
  },
};

export default invoiceService;
