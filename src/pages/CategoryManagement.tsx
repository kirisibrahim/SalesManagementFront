import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import categoryService from "../services/categoryService";
import "../styles/Management.css";

interface Category {
  id: number;
  name: string;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null); // Silinecek kategori idsini tutan state

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (error) {
      message.error("Kategoriler yüklenirken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null); // Yeni kategori eklerken eski veriler temizlensin
    form.resetFields();
    setIsModalOpen(true);
  };

  const showDeleteConfirm = (id: number) => {
    setDeletingCategoryId(id);
    setIsModalOpen(true); 
  };

  const handleDelete = async () => {
    if (deletingCategoryId !== null) {
      try {
        await categoryService.deleteCategory(deletingCategoryId);
        message.success("Kategori başarıyla silindi!");
        fetchCategories();
      } catch (error) {
        message.error("Kategori silinirken hata oluştu!");
      }
      setIsModalOpen(false);
      setDeletingCategoryId(null); // Silme işleminden sonra id sıfırla
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // jsona idyi de ekleyerek put ediyoruz
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { id: editingCategory.id, ...values });
        message.success("Kategori başarıyla güncellendi!");
      } else {
        await categoryService.addCategory(values);
        message.success("Yeni kategori başarıyla eklendi!");
      }
      fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
    }
  };

  const columns = [
    { title: "Kategori İsmi", dataIndex: "name", key: "name" },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: Category) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          <Button onClick={() => handleEdit(record)} type="primary" style={{ marginRight: 8 }}>
            Güncelle
          </Button>
          <Button onClick={() => showDeleteConfirm(record.id)} type="primary" danger className="delete-button">
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
          Yeni Kategori Ekle
        </Button>
      </div>
      <Table dataSource={categories} columns={columns} rowKey="id" loading={loading} />
      
      <Modal
        title="Kategori Silme Onayı"
        visible={isModalOpen && deletingCategoryId !== null}
        onOk={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        okText="Evet, Sil"
        cancelText="Hayır"
      >
        <p>
          <strong>SİLME İŞLEMİNİ OANYLIYOR MUSUNUZ?</strong>
        </p>
      </Modal>
      <Modal
        title={editingCategory ? "Kategori Güncelle" : "Yeni Kategori Ekle"}
        visible={isModalOpen && deletingCategoryId === null}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Kategori Adı"
            rules={[{ required: true, message: "Bu alan zorunludur!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
