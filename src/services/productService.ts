import axios from "axios";

const API_URL = "https://localhost:7048/api/product";

const productService = {

  getProducts: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Ürünleri çekerken hata oluştu:", error);
      throw error;
    }
  },

  addProduct: async (productData: { name: string; barcode: string; price: number; stockQuantity: number; categoryId: number; supplierId: number; description:string  }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Ürün eklerken hata oluştu:", error);
      throw error;
    }
  },

  updateProduct: async (id: number, productData: { name: string; barcode: string; price: number; stockQuantity: number; categoryId: number; supplierId: number; description:string }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Ürün güncellerken hata oluştu:", error);
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Ürün silerken hata oluştu:", error);
      throw error;
    }
  },

  getProductById: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Yalnızca ürün ismini döndürüyoruz
      return response.data.name;
    } catch (error) {
      console.error("Ürün detayları çekilirken hata oluştu:", error);
      throw error;
    }
  },
};

export default productService;
