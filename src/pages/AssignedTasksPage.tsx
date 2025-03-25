import { useState, useEffect } from "react";
import { Table, Button, Modal, Select, message, Tag } from "antd";
import { getUserInfo } from "../services/authService"; 
import taskService from "../services/taskService";
import "../styles/TaskManagement.css";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";

const { Option } = Select;

const statusOptions = [
  { value: 0, label: 'Yeni' },
  { value: 1, label: 'İşlem Devam Ediyor' },
  { value: 2, label: 'Tamamlandı' },
  { value: 3, label: 'İptal Edildi' },
];

const statusMap: Record<number, string> = {
  0: "Yeni",
  1: "İşlem Devam Ediyor",
  2: "Tamamlandı",
  3: "İptal Edildi",
};


const AssignedTasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Durum güncelleme modalı için state'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  // Giriş yapan kullanıcının bilgilerini alıyoruz
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setUserId(userInfo.userId);
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Kullanıcı bilgisine göre atanmış görevleri çekiyoruz
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (userId !== null) {
        setLoading(true);
        try {
          const assignedTasks = await taskService.getAssignedTasks(userId);
          setTasks(assignedTasks);
        } catch (error) {
          console.error("Görevler alınırken hata oluştu:", error);
          message.error("Görevler alınırken hata oluştu!");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAssignedTasks();
  }, [userId]);

  const openStatusModal = (task: any) => {
    setSelectedTask(task);
    setSelectedStatus(task.durum);
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    if (selectedTask && selectedStatus !== null) {
      try {
        // Mevcut task bilgisinden diğer alanları alıp, sadece durum güncellenecek.
        const updatedTaskData = {
          title: selectedTask.title,
          description: selectedTask.description,
          userIds: selectedTask.userIds,
          durum: selectedStatus, // Yeni durum değeri
        };
  
        await taskService.updateTask(selectedTask.id, updatedTaskData);
        message.success("Görev durumu başarıyla güncellendi.");   
        // Güncellenmiş görev listesini çekiyoruz
        const assignedTasks = await taskService.getAssignedTasks(userId!);
        setTasks(assignedTasks);
        setIsModalOpen(false);
        setSelectedTask(null);
        setSelectedStatus(null);
      } catch (error) {
        console.error("Görev durumu güncellenirken hata oluştu:", error);
        message.error("Görev durumu güncellenemedi.");
      }
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
      width: "35%",
      render: (text: string) => (
        <div className="task-description">{text}</div>
      ),
    },
    {
      title: "Görev Durumu",
      dataIndex: "durum",
      key: "durum",
      width: "10%",
      render: (status: number) => {
        const statusString = statusMap[status] || "Bilinmiyor";
        let color = "";
        let icon;
    
        switch (statusString) {
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
        return <Tag icon={icon} color={color}>{statusString}</Tag>;
      },
    },
    {
      title: "Durum Güncelle",
      key: "update",
      width: "20%",
      render: (_text: any, record: any) => (
        <Button type="primary" onClick={() => openStatusModal(record)}>
          Durumu Güncelle
        </Button>
      ),
    },
  ];

  return (
    <div className="task-management-container">
      <h2>Atanmış Görevler</h2>
      <div className="task-table-wrapper">
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          style={{ width: "100%", tableLayout: "fixed" }}
          pagination={false}
        />
      </div>
      <Modal
        title="Görev Durumunu Güncelle"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleModalOk}
        okText="Tamam" cancelText="İptal"
      >
        {selectedTask && (
          <>
            <p>
              <strong>{selectedTask.title}</strong>
            </p>
            <p>{selectedTask.description}</p>
            <Select
              defaultValue={selectedStatus!}
              style={{ width: 200 }}
              onChange={(value) => setSelectedStatus(value)}
            >
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AssignedTasksPage;
