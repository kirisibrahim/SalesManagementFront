import { Key, useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import supplierService from "../services/supplierService";
import "../styles/ProductManagement.css";

interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  supplierId: number;
  description: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCategoriesAndSuppliers = async () => {
      try {
        const categoriesResponse = await categoryService.getCategories();
        const suppliersResponse = await supplierService.getSuppliers();
        setCategories(categoriesResponse);
        setSuppliers(suppliersResponse);
      } catch (error) {
        message.error("Kategoriler veya tedarikçiler alınırken hata oluştu.");
      }
    };
    fetchCategoriesAndSuppliers();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response);
    } catch (error) {
      message.error("Ürünleri çekerken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        const dataToSend = {
          ...values,
          id: editingProduct.id, // id ekleyerek gönderiyoruz
        };
  
        console.log("Güncelleme İçin Gönderilen Veri:", dataToSend);
  
        await productService.updateProduct(editingProduct.id, dataToSend);
        message.success("Ürün başarıyla güncellendi!");
      } else {
        await productService.addProduct(values);
        message.success("Yeni ürün başarıyla eklendi!");
      }
  
      fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
      console.error("Hata Detayı:", error);
    }
  };
  
  const showDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!deletingProduct) return;
  
    try {
      await productService.deleteProduct(deletingProduct.id);
      message.success("Ürün başarıyla silindi!");
      fetchProducts();
    } catch (error) {
      message.error("Ürün silme işlemi başarısız!");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    }
  };
  
  const columns = [
    { 
      title: "Ürün İsmi", 
      dataIndex: "name", 
      key: "name",
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ürün ismi ara"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys([e.target.value])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Ara
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Temizle
          </Button>
        </div>
      ),
      onFilter: (value: boolean | Key, record: Product) => record.name === value,
      render: (text: string) => <span className="bold-text">{text}</span>
    },
    { 
      title: "Barkod", 
      dataIndex: "barcode", 
      key: "barcode", 
      sorter: (a: Product, b: Product) => a.barcode.localeCompare(b.barcode),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Barkod ara"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys([e.target.value])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Ara
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Temizle
          </Button>
        </div>
      ),
      onFilter: (value: boolean | Key, record: Product) => record.barcode === value,
      render: (text: string) => <span className="bold-text">{text}</span>
    },
    { 
      title: "Fiyat", 
      dataIndex: "price", 
      key: "price", 
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (text: number) => <span className="bold-text">{text} ₺</span>
    },
    { 
      title: "Stok", 
      dataIndex: "stockQuantity", 
      key: "stockQuantity", 
      sorter: (a: Product, b: Product) => a.stockQuantity - b.stockQuantity,
      render: (stock: number) => {
        let stockClass = "stock-high"; // Default class
        if (stock <= 10) {
          stockClass = "stock-low";  // 10 and below: red
        } else if (stock > 10 && stock < 50) {
          stockClass = "stock-medium"; // 10 to 50: green
        }
  
        return (
          <span className={`bold-text ${stockClass}`}>{stock}</span>
        );
      }
    },
    { 
      title: "Kategori", 
      dataIndex: "categoryId", 
      key: "categoryId", 
      render: (text: number) => {
        const category = categories.find(cat => cat.id === text);
        return (
          <span
            className="bold-text"
            style={{ backgroundColor: category ? "transparent" : "#ffcccc", display: "inline-block", width: "100%" }}
          >
            {category?.name || "Tanımsız"}
          </span>
        );
      },
      filters: categories.map((category) => ({
        text: category.name,
        value: category.id,
      })),
      onFilter: (value: boolean | Key, record: Product) => record.categoryId === value,
    },
    {
      title: "Tedarikçi",
      dataIndex: "supplierId",
      key: "supplierId",
      render: (supplierId: number) => {
        const supplier = suppliers.find((sup) => sup.id === supplierId);
        return (
          <span
            className="bold-text"
            style={{ backgroundColor: supplier ? "transparent" : "#ffcccc", display: "inline-block", width: "100%" }}
          >
            {supplier?.name || "Tanımsız"}
          </span>
        );
      },
      filters: suppliers.map((supplier) => ({
        text: supplier.name,
        value: supplier.id,
      })),
      onFilter: (value: boolean | Key, record: Product) => record.supplierId === value,
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: Product) => (
        <div>
          <Button onClick={() => handleEdit(record)} type="primary" style={{ marginRight: 8 }}>
            Güncelle
          </Button>
          <Button onClick={() => showDeleteModal(record)} type="primary" danger>
            Sil
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Yeni Ürün Ekle
      </Button>
      
      <Table 
        dataSource={products} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
        pagination={{ pageSize: 10 }}
        locale={{
          filterConfirm: "Uygula",
          filterReset: "Sıfırla",
        }}
      />
      <Modal
        title={editingProduct ? "Ürün Güncelle" : "Yeni Ürün Ekle"}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Ekle"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ürün İsmi" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="barcode" label="Barkod" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Fiyat" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="stockQuantity" label="Stok Miktarı" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="categoryId" label="Kategori">
            <Select>
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="supplierId" label="Tedarikçi">
            <Select>
              {suppliers.map((supplier) => (
                <Select.Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
         title="Silme Onayı"
         visible={isDeleteModalOpen}
         onOk={confirmDelete}
         onCancel={() => setIsDeleteModalOpen(false)}
         okText="Evet, Sil"
         cancelText="İptal"
         okButtonProps={{ danger: true }}
      >
        <p><strong>{deletingProduct?.name}</strong> adlı ürünü silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
};

export default ProductManagement;
