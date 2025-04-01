import { useEffect, useState } from "react";
import { Table, message, Button, DatePicker, Modal, Form, Input, Select, InputNumber } from "antd";
import type { ColumnType } from "antd/es/table";
import invoiceService from "../services/invoiceService";
import customerService from "../services/customerService";
import productService from "../services/productService";
import moment from "moment";

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSales, setSelectedSales] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null); // Seçilen ürün
  const [quantity, setQuantity] = useState<number>(1); // Adet
  const [addedProducts, setAddedProducts] = useState<any[]>([]); // Eklenen ürünler

  const [invoiceForm] = Form.useForm();
 

  // Tüm müşteri verilerini çek
  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      if (response && Array.isArray(response)) {
        setCustomers(response);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Müşteriler alınırken hata oluştu", error);
      message.error("Müşteriler alınırken bir hata oluştu!");
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      if (response && Array.isArray(response)) {
        setProducts(response);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu", error);
      message.error("Ürünler alınırken bir hata oluştu!");
    }
  };
  

  // Faturaları API'den al
  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getInvoices();
      if (response.data && Array.isArray(response.data)) {
        setInvoices(response.data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Faturalar alınırken hata oluştu", error);
      message.error("Faturalar alınırken bir hata oluştu!");
    }
  };

  // Fatura silme fonksiyonu
  const handleDelete = async (invoiceId: number) => {
    try {
      await invoiceService.deleteInvoice(invoiceId);
      message.success("Fatura başarıyla silindi!");
      fetchInvoices();
      fetchCustomers(); // Müşteriler de güncellensin
    } catch (error) {
      console.error("Fatura silinirken hata oluştu", error);
      message.error("Fatura silinirken bir hata oluştu!");
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
    fetchProducts();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
    invoiceForm.resetFields();
    setSelectedSales([]);
  };

  const handleAddSale = (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const totalPrice = product.price * quantity;
      setSelectedSales([...selectedSales, { productId, quantity, totalPrice, productName: product.name }]);
    }
  };

  const handleProductChange = (value: any) => {
    const product = products.find((p) => p.id === value);
    setSelectedProduct(product);
  };
  
  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };
  
  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      const totalPrice = selectedProduct.price * quantity;
      const newProduct = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        totalPrice,
      };
      setAddedProducts((prevProducts) => [...prevProducts, newProduct]);
      setSelectedProduct(null);
      setQuantity(1); // Adet sıfırlama
    } else {
      message.error("Lütfen geçerli bir ürün ve adet girin!");
    }
  };
  
  
  const handleInvoiceSubmit = async (values: any) => {
    try {
      const newInvoice = {
        invoiceNumber: values.invoiceNumber,
        customerId: values.customerId,
        sales: selectedSales.map((sale) => ({
          productId: sale.productId,
          quantity: sale.quantity,
          totalPrice: sale.totalPrice,
        })),
      };
      await invoiceService.createInvoice(newInvoice);
      message.success("Fatura başarıyla eklendi!");
      fetchInvoices();
      handleCancel();
    } catch (error) {
      console.error("Fatura eklenirken hata oluştu", error);
      message.error("Fatura eklenirken bir hata oluştu!");
    }
  };

  const handleCreateInvoice = async (values: any) => {
    const invoiceData = {
      invoiceNumber: values.invoiceNumber,
      issueDate: moment(values.issueDate).format("YYYY-MM-DD"),
      customerId: values.customerId,
      sales: addedProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
        totalPrice: product.totalPrice,
      })),
    };
  
    try {
      const response = await invoiceService.createInvoice(invoiceData);
      message.success("Fatura başarıyla oluşturuldu!");
      fetchInvoices();
      setIsModalOpen(false); // Modal'ı kapat
    } catch (error) {
      console.error("Fatura oluşturulurken hata oluştu", error);
      message.error("Fatura oluşturulurken bir hata oluştu!");
    }
  };
  
  

  // Müşteri id'sine göre müşteri ismini döndüren fonksiyon
  const getCustomerName = (customerId: number): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Bilinmiyor";
  };

  // Tablo sütunlarını ColumnType<any>[] olarak tanımlıyoruz
  const columns: ColumnType<any>[] = [
    {
      title: "Fatura Numarası",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <input
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            placeholder="Fatura numarası ile ara"
            style={{ marginBottom: 8, display: "block", width: 188 }}
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
      filterIcon: () => <span>🔍</span>,
      onFilter: (value: boolean | React.Key, record: any): boolean =>
        record.invoiceNumber.toString().toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: "Fatura Tarihi",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (text: string) => moment(text).format("DD.MM.YYYY"),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            style={{ marginBottom: 8, display: "block", width: 188 }}
            format="DD.MM.YYYY"
            onChange={(date, dateString) => {
              setSelectedKeys(dateString ? [dateString] : []);
            }}
            value={selectedKeys[0] ? moment(selectedKeys[0], "DD.MM.YYYY") : null}
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
      filterIcon: () => <span>🔍</span>,
      onFilter: (value: boolean | React.Key, record: any): boolean =>
        moment(record.issueDate)
          .format("DD.MM.YYYY")
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
    },
    {
      title: "Toplam Tutar",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text: number) => text.toFixed(2),
      sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Müşteri İsmi",
      dataIndex: "customerId",
      key: "customerId",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <input
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            placeholder="Müşteri ismi ile ara"
            style={{ marginBottom: 8, display: "block", width: 188 }}
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
      filterIcon: () => <span>🔍</span>,
      onFilter: (value: boolean | React.Key, record: any): boolean =>
        getCustomerName(record.customerId).toLowerCase().includes(value.toString().toLowerCase()),
      render: (_: any, record: any) => getCustomerName(record.customerId),
    },
    {
      title: "İşlemler",
      key: "operations",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          danger
          onClick={() => handleDelete(record.id)}
        >
          Sil
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
  Yeni Fatura Ekle
</Button>

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
      <Modal
  title="Yeni Fatura Ekle"
  open={isModalOpen}
  onCancel={handleCancel}
  footer={null}
  width={800}
>
  <Form form={invoiceForm} layout="vertical" onFinish={handleInvoiceSubmit}>
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Sol Taraf - Fatura Bilgileri */}
      <div style={{ flex: 1 }}>
        <Form.Item name="invoiceNumber" label="Fatura Numarası" rules={[{ required: true, message: "Gerekli!" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="customerId" label="Müşteri Seçimi" rules={[{ required: true, message: "Gerekli!" }]}>
          <Select placeholder="Müşteri Seçin">
            {customers.map((customer) => (
              <Select.Option key={customer.id} value={customer.id}>
                {customer.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      {/* Sağ Taraf - Satış Bilgileri */}
      <div>
  <Select
    style={{ width: 200 }}
    placeholder="Ürün Seçin"
    onChange={handleProductChange}
  >
    {products.map((product) => (
      <Select.Option key={product.id} value={product.id}>
        {product.name}
      </Select.Option>
    ))}
  </Select>
  <InputNumber
    min={1}
    value={quantity}
    onChange={handleQuantityChange}
    style={{ marginLeft: 10, width: 80 }}
  />
  <Button
    type="primary"
    onClick={handleAddProduct}
    style={{ marginLeft: 10 }}
  >
    Ürün Ekle
  </Button>
</div>

<div style={{ marginTop: 20 }}>
  <Table
    dataSource={addedProducts}
    columns={[
      { title: "Ürün Adı", dataIndex: "productName" },
      { title: "Adet", dataIndex: "quantity" },
      { title: "Toplam Tutar", dataIndex: "totalPrice", render: (text) => text.toFixed(2) },
    ]}
    rowKey="productId"
    pagination={false}
  />
</div>

    </div>

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Kaydet
      </Button>
    </Form.Item>
  </Form>
</Modal>

    </div>
    
  );
};

export default InvoiceManagement;
