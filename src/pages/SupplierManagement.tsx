import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import supplierService from "../services/supplierService";
import "../styles/Management.css";

interface Supplier {
  id: number;
  name: string;
  contactInfo: string;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierService.getSuppliers();
      setSuppliers(response); // gelen veriyi state aktardık
    } catch (error) {
      message.error("Tedarikçileri yüklerken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (supplierToDelete !== null) {
      try {
        await supplierService.deleteSupplier(supplierToDelete);
        message.success("Tedarikçi başarıyla silindi!");
        fetchSuppliers(); // Silme işleminden sonra listeyi güncelle
        setIsDeleteModalVisible(false);
      } catch (error) {
        message.error("Tedarikçi silme işlemi başarısız!");
      }
    }
  };

  const showDeleteModal = (id: number) => {
    setSupplierToDelete(id); // supplier id state kaydet
    setIsDeleteModalVisible(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null); //yeni eklemek için editingsupplier null olmalı
    form.resetFields(); 
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      //düzenleme yapıyorsak idyi ekliyoruz
      const dataToSend = {
        ...values,
        id: editingSupplier?.id,
      };
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, dataToSend);
        message.success("Tedarikçi başarıyla güncellendi!");
      } else {
        await supplierService.addSupplier(values);
        message.success("Yeni tedarikçi başarıyla eklendi!");
      }
      fetchSuppliers();
      setIsModalOpen(false); // Modal'ı kapat
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
      console.error("Hata:", error); // Hata mesajını konsola yazdır
    }
  };
  
  const columns = [
    { title: "Tedarikçi İsmi", dataIndex: "name", key: "name" },
    { title: "Tedarikçi İletişim Numarası", dataIndex: "contactInfo", key: "contactInfo" },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: Supplier) => (
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
          Yeni Tedarikçi Ekle
        </Button>
      </div>
      <Table dataSource={suppliers} columns={columns} rowKey="id" loading={loading} />
      <Modal
        title={editingSupplier ? "Tedarikçi Güncelle" : "Yeni Tedarikçi Ekle"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()} 
        okText="Ekle"
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={editingSupplier ? { name: editingSupplier.name, contactInfo: editingSupplier.contactInfo } : {}}

        >
          <Form.Item
            name="name"
            label="Tedarikçi İsmi"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contactInfo"
            label="Tedarikçi İletişim Numarası"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="TEDARİKÇİYİ SİL!"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Evet, Sil"
        cancelText="İptal"
      >
        <p>
          <strong>SİLME İŞLEMİNİ OANYLIYOR MUSUNUZ?</strong>
        </p>
      </Modal>
    </div>
  );
};

export default SupplierManagement;
