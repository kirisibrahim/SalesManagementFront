import { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Input, notification } from "antd";
import customerService from "../services/customerService";
import "../styles/Management.css";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (error) {
      notification.error({ message: "Müşteriler yüklenemedi." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (values: any) => {
    try {
      await customerService.addCustomer(values);
      notification.success({ message: "Müşteri başarıyla eklendi!" });
      fetchCustomers();
      setIsModalVisible(false);
    } catch (error) {
      notification.error({ message: "Müşteri eklenirken hata oluştu!" });
    }
  };

  const handleUpdateCustomer = async (values: any) => {
    if (!currentCustomer) return;
    try {
      // ID'yi de ekliyoruz
      const updatedCustomer = { ...values, id: currentCustomer.id };
      await customerService.updateCustomer(currentCustomer.id, updatedCustomer);
      notification.success({ message: "Müşteri başarıyla güncellendi!" });
      fetchCustomers();
      setIsModalVisible(false);
    } catch (error) {
      notification.error({ message: "Müşteri güncellenirken hata oluştu!" });
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomerId) return;
    try {
      await customerService.deleteCustomer(deletingCustomerId);
      notification.success({ message: "Müşteri başarıyla silindi!" });
      fetchCustomers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      notification.error({ message: "Müşteri silinirken hata oluştu!" });
    }
  };

  const handleEditCustomer = (customer: any) => {
    setIsEdit(true);
    setCurrentCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      taxNumber: customer.taxNumber,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEdit(false);
    setCurrentCustomer(null);
  };

  const columns = [
    { title: "İsim", dataIndex: "name", key: "name", className: "table-header" },
    { title: "E-posta", dataIndex: "email", key: "email", className: "table-header" },
    { title: "Telefon", dataIndex: "phoneNumber", key: "phoneNumber", className: "table-header" },
    { title: "Adres", dataIndex: "address", key: "address", className: "table-header" },
    { title: "Vergi Numarası", dataIndex: "taxNumber", key: "taxNumber", className: "table-header" },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: any) => (
        <div className="action-buttons">
          <Button
            onClick={() => handleEditCustomer(record)}
            type="primary"
            className="edit-button"
          >
            Düzenle
          </Button>
          <Button
            onClick={() => {
              setDeletingCustomerId(record.id);
              setIsDeleteModalOpen(true);
            }}
            type="primary"
            danger
            className="delete-button"
          >
            Sil
          </Button>
        </div>
      ),
      className: "table-header",
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setIsEdit(false);
          setIsModalVisible(true);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        Yeni Müşteri Ekle
      </Button>

      <Table
        dataSource={customers}
        columns={columns}
        rowKey="id"
        loading={loading}
        className="animated-table"
      />

      <Modal
        title={isEdit ? "Müşteri Güncelle" : "Yeni Müşteri Ekle"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText="Tamam"
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isEdit ? handleUpdateCustomer : handleAddCustomer}
        >
          <Form.Item
            name="name"
            label="İsim"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-posta"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Telefon"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Adres"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taxNumber"
            label="Vergi Numarası"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Müşteriyi Sil!"
        open={isDeleteModalOpen}
        onOk={handleDeleteCustomer}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Evet, Sil"
        cancelText="İptal"
      >
        <p>Bu müşteri silinecek, emin misiniz?</p>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
