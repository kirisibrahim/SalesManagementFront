import axios from "axios";

const API_URL = "https://localhost:7048/api/taskstask";
const API_USER_URL = "https://localhost:7048/api/user";

interface TaskData {
  title: string;
  description: string;
  durum: number;
  userIds: number[]; //apiden userid dizisi geleiyor
}

const taskService = {

  getTasks: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Görevleri çekerken hata oluştu:", error);
      throw error;
    }
  },

  addTask: async (taskData: TaskData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(API_URL, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Görev eklerken hata oluştu:", error);
      throw error;
    }
  },

  updateTask: async (id: number, taskData: TaskData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${id}`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Görev güncellerken hata oluştu:", error);
      throw error;
    }
  },

  deleteTask: async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Görev silerken hata oluştu:", error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(API_USER_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Kullanıcıları çekerken hata oluştu:", error);
      throw error;
    }
  },
  removeUserFromTask: async (taskId: number, userId: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${taskId}/remove/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Kullanıcı görevden kaldırılırken hata oluştu:", error);
      throw error;
    }
  },
  getAssignedTasks: async (userId: number) => {
    try {
      const token = sessionStorage.getItem("token");

      // userid parametresi ile görevleri çekiyoruz
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error("Görevleri çekerken hata oluştu:", error);
      throw error;
    }
  },
};

export default taskService;
