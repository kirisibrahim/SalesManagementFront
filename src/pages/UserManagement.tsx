import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Tooltip } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import userService from "../services/userService";
import "../styles/UserManagement.css";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  passwordHash?: string;
  roleId: number;
  roleName: string;
}

const { Option } = Select;

const PasswordCell = ({ password }: { password?: string }) => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible(!visible);
    if (!visible) {
      setTimeout(() => setVisible(false), 3000);
    }
  };

  return (
    <Tooltip title="Şifreyi görmek için tıklayın">
      <span
        onClick={toggleVisibility}
        style={{
          cursor: "pointer", 
          userSelect: "none", 
          display: "flex", 
          alignItems: "center", 
          gap: "5px", 
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        {visible ? password : "*****"}
        {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </span>
    </Tooltip>
  );
};


const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      message.error("Kullanıcıları yüklerken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await userService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      message.error("Rolleri yüklerken hata oluştu!");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        const updatedUser = { ...values, id: editingUser.id };
        await userService.updateUser(editingUser.id, updatedUser);
        message.success("Kullanıcı başarıyla güncellendi!");
      } else {
        await userService.addUser(values);
        message.success("Yeni kullanıcı başarıyla eklendi!");
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
    }
  };

  const handleDelete = async () => {
    if (deletingUserId === null) return;
    try {
      await userService.deleteUser(deletingUserId);
      message.success("Kullanıcı başarıyla silindi!");
      fetchUsers();
    } catch (error) {
      message.error("Kullanıcı silme işlemi başarısız!");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
    }
  };

  const columns = [
    { title: "Kullanıcı Adı", dataIndex: "username", key: "username", className: "table-header" },
    { title: "Şifre", dataIndex: "passwordHash", key: "passwordHash", render: (text: string) => <PasswordCell password={text} />, className: "table-header" },
    { title: "Rol", dataIndex: "roleName", key: "roleName", className: "table-header" },
    {
      title: "İşlemler",
      key: "actions",
      className: "table-header",
      render: (_: any, record: User) => (
        <div className="action-buttons">
          <Button onClick={() => handleEdit(record)} type="primary" className="edit-button">Güncelle</Button>
          <Button onClick={() => {setDeletingUserId(record.id);setIsDeleteModalOpen(true);}} type="primary" danger className="delete-button">Sil</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>Yeni Kullanıcı Ekle</Button>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} className="animated-table" />
      
      <Modal title={editingUser ? "Kullanıcı Güncelle" : "Yeni Kullanıcı Ekle"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSave} okText="Tamam" cancelText="İptal">
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Kullanıcı Adı" rules={[{ required: true, message: "Bu alan zorunludur!" }]}><Input /></Form.Item>
          <Form.Item name="passwordHash" label="Şifre" rules={[{ required: true, message: "Bu alan zorunludur!" }]}><Input.Password /></Form.Item>
          <Form.Item name="roleId" label="Rol" rules={[{ required: true, message: "Rol seçiniz!" }]}>
            <Select>{roles.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}</Select>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal title="KULLANICIYI SİL!" open={isDeleteModalOpen} onOk={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} okText="Evet, Sil" cancelText="İptal">
        <p>Bu kullanıcıyı silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
};

export default UserManagement;
