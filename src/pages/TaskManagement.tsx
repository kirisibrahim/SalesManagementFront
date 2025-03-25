import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Tag } from "antd";
import taskService from "../services/taskService";
import "../styles/TaskManagement.css";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined,UserOutlined } from "@ant-design/icons";

const { Option } = Select;

// Tip tanımlamaları
interface User {
  id: number;
  username: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  userIds: number[];
  assignedUsers: string[];
}

// durumları numberdan stringe çeviriyoruz
const mapDurumToString = (durum: number): string => {
  switch (durum) {
    case 0:
      return "Yeni";
    case 1:
      return "İşlem Devam Ediyor";
    case 2:
      return "Tamamlandı";
    case 3:
      return "İptal Edildi";
    default:
      return "Bilinmiyor";
  }
};

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // kullanıcıları çek
  useEffect(() => {
    fetchUsers();
  }, []);

  // kullanıcılardan sonra görevleri çek
  useEffect(() => {
    if (users.length > 0) {
      fetchTasks();
    }
  }, [users]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks();
      const tasksData = response.data;
      // Her görevin useridsini users stateindeki kullanıcılarla eşleştirip
      // APIdeki durum değerini stringe çeviriyoruz.
      const updatedTasks = tasksData.map((task: any) => {
        const assignedUsers = task.userIds.map((userId: number) => {
          const user = users.find((user) => user.id === userId);
          return user ? user.username : null;
        }).filter(Boolean);

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: mapDurumToString(task.durum), // durum değeri stringe çevriliyor.
          userIds: task.userIds,
          assignedUsers: assignedUsers.length ? assignedUsers : ["Atanan kullanıcı yok"],
        };
      });

      setTasks(updatedTasks);
    } catch (error) {
      message.error("Görevleri yüklerken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await taskService.getUsers();
      setUsers(usersData);
    } catch (error) {
      message.error("Kullanıcıları yüklerken hata oluştu!");
    }
  };

  const showDeleteModal = (id: number) => {
    setDeletingTaskId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingTaskId === null) return;

    try {
      await taskService.deleteTask(deletingTaskId);
      message.success("Görev başarıyla silindi!");
      fetchTasks();
    } catch (error) {
      message.error("Görev silme işlemi başarısız!");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingTaskId(null);
    }
  };

  const handleRemoveUser = async (taskId: number, userId: number) => {
    try {
      await taskService.removeUserFromTask(taskId, userId);
      message.success("Kullanıcı başarıyla kaldırıldı!");
      fetchTasks(); // Güncellenmiş görev listesini tekrar çek
    } catch (error) {
      message.error("Kullanıcı kaldırılırken hata oluştu.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status, // String olarak ayarlıyoruz
      userIds: task.userIds,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
  
      // Durumun sayısal değere dönüştürülmesi
      const statusMapping = {
        "Yeni": 0,
        "İşlem Devam Ediyor": 1,
        "Tamamlandı": 2,
        "İptal Edildi": 3,
      };
  
      const taskData = {
        ...values,
        userIds: values.userIds, // Formdan gelen kullanıcı ID'leri
        durum: statusMapping[values.status as keyof typeof statusMapping], // Tür güvenliği ekleniyor
      };
  
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
        message.success("Görev başarıyla güncellendi!");
      } else {
        await taskService.addTask(taskData);
        message.success("Yeni görev başarıyla eklendi!");
      }
  
      fetchTasks();
      setIsModalOpen(false);
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
    }
  };
  

  const columns = [
    {
      title: "Görev Başlığı",
      dataIndex: "title",
      key: "title",
      width: "15%",
    },
    {
      title: "Görev Açıklaması",
      dataIndex: "description",
      key: "description",
      width: "35%",  // Sabit genişlik
      render: (text: string) => (
        <div className="task-description">{text}</div>
      ),
    }, 
    {
      title: "Görev Durumu",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status: string) => {
        let color = "";
        let icon;
        switch (status) {
          case "Yeni":
            color = "default";
            icon = <ClockCircleOutlined spin />;
            break;
          case "İşlem Devam Ediyor":
            color = "processing";
            icon = <SyncOutlined spin />;
            break;
          case "Tamamlandı":
            color = "success";
            icon = <CheckCircleOutlined spin />;
            break;
          case "İptal Edildi":
            color = "error";
            icon = <CloseCircleOutlined spin />;
            break;
          default:
            color = "default";
        }
        return <Tag icon={icon} color={color}>{status}</Tag>;
      },
    },
    {
      title: "Göreve Atanan Kişiler",
      dataIndex: "assignedUsers",
      key: "assignedUsers",
      width: "20%",
      render: (users: string[], record: Task) =>
        users.length > 0 ? (
          users.map((user: string, index: number) => (
            <div key={index} className="GorevDiv">
              <span className="userstyle"><UserOutlined/> {user}</span>
              <Button
                type="primary"
                className="task-assigned-users-button"
                onClick={() => handleRemoveUser(record.id, record.userIds[index])}
              >
                Kaldır
              </Button>
            </div>
          ))
        ) : (
          <span>Atanan kullanıcı yok</span>
        ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: Task) => (
        <div>
          <Button onClick={() => handleEdit(record)} type="primary">
            Güncelle
          </Button>
          <Button
            onClick={() => showDeleteModal(record.id)}
            type="primary"
            danger
            style={{ marginLeft: 8 }}
          >
            Sil
          </Button>
        </div>
      ),
      width: "20%",
    },
  ];

  return (
    <div className="task-management-container">
      <Button type="primary" onClick={handleAdd} className="add-task-button">
        Yeni Görev Ekle
      </Button>
      <div className="task-table-wrapper">
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          style={{ width: "100%", tableLayout: "fixed" }} 
          pagination={{ pageSize: 10 }}
        />
      </div>
      <Modal
        title={editingTask ? "Görev Güncelle" : "Yeni Görev Ekle"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Tamam" cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Görev Başlığı"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Görev Açıklaması"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label="Durum"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Select>
              <Option value="Yeni">Yeni</Option>
              <Option value="İşlem Devam Ediyor">İşlem Devam Ediyor</Option>
              <Option value="Tamamlandı">Tamamlandı</Option>
              <Option value="İptal Edildi">İptal Edildi</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="userIds"
            label="Atanan Kişiler"
            rules={[{ required: true, message: "En az bir kullanıcı seçmelisiniz!" }]}
          >
            <Select mode="multiple" allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Görev Sil"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
        cancelText="İptal"
        okText="Onayla"
      >
        <p>Bu görevi silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
};

export default TaskManagement;
