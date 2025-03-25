import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import roleService from "../services/roleService";
import "../styles/Management.css";

interface Role {
  id: number;
  name: string;
}

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); 
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null); // Silinecek rolid tutan state
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleService.getRoles();
      setRoles(response);
    } catch (error) {
      message.error("Rolleri yüklerken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (roleToDelete !== null) {
      try {
        await roleService.deleteRole(roleToDelete);
        message.success("Rol başarıyla silindi!");
        fetchRoles();
        setIsDeleteModalVisible(false); // Modal'ı kapat
      } catch (error) {
        message.error("Rol silme işlemi başarısız!");
      }
    }
  };

  const showDeleteModal = (id: number) => {
    setRoleToDelete(id); 
    setIsDeleteModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await roleService.updateRole(editingRole.id, values);
        message.success("Rol başarıyla güncellendi!");
      } else {
        await roleService.addRole(values);
        message.success("Yeni rol başarıyla eklendi!");
      }
      fetchRoles();
      setIsModalOpen(false);
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
    }
  };

  const columns = [
    { title: "Rol Adı", dataIndex: "name", key: "name"},
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: Role) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          <Button onClick={() => handleEdit(record)} type="primary" style={{ marginRight: 8 }}>
            Güncelle
          </Button>
          <Button onClick={() => showDeleteModal(record.id)} type="primary" danger className="delete-button">
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          Yeni Rol Ekle
        </Button>
      </div>
      <Table dataSource={roles} columns={columns} rowKey="id" loading={loading} />
      <Modal title={editingRole ? "Rol Güncelle" : "Yeni Rol Ekle"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSave} okText="Ekle" cancelText="İptal">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Rol Adı" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="ROLÜ SİL!"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Evet, Sil"
        cancelText="İptal"
      >
        <p>Bir rolü sildiğinizde role ait tüm kullnıcılar admin rolüne sahip olur, önerimiz rolü silmeden önce o role sahip kullanıcıları silmeniz veya kullanıcı rollerini düzenlemeniz.</p>
        <p>Rolü Silmek İstediğinize Emin Misiniz?</p>
      </Modal>
    </div>
  );
};

export default RoleManagement;
