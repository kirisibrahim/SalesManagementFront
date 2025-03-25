import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Select, DatePicker } from "antd";
import saleService from "../services/saleService";
import productService from "../services/productService";
import "../styles/Management.css";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import 'dayjs/locale/tr';

dayjs.extend(customParseFormat);

interface Sale {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  saleDate: string;
  invoiceId: number | null;
  productName?: string;
}

const SaleManagement = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [form] = Form.useForm();
  const [products, setProducts] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSaleId, setDeletingSaleId] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState<[Dayjs | null, Dayjs | null]>([null, null]); // tarih filtreleme state

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [filterDate]); // filterdate değişirse sale verileri tekrar çek

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getSales();
      const updatedSales = await Promise.all(
        response.map(async (sale: Sale) => {
          const product = await productService.getProductById(sale.productId);
          sale.productName = product;
          return sale;
        })
      );
      const filteredSales = updatedSales.filter((sale) => {
        const saleDate = dayjs(sale.saleDate);
        if (filterDate[0] && filterDate[1]) {
          return saleDate.isAfter(filterDate[0]) && saleDate.isBefore(filterDate[1]);
        }
        return true;
      });

      setSales(filteredSales);
    } catch (error) {
      message.error("Satış verileri yüklenirken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response);
    } catch (error) {
      message.error("Ürün verileri yüklenirken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    form.setFieldsValue({
      ...sale,
      saleDate: sale.saleDate ? dayjs(sale.saleDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSale(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
  
      // Tarih formatını ISO formatına dönüştür
      values.saleDate = values.saleDate?.toISOString(); // Dayjs tarih formatı
  
      if (editingSale) {
        console.log("Güncellenen Satış ID: ", editingSale.id);
  
        // 'id'yi de values içine ekleyin
        values.id = editingSale.id;  // id'yi burada ekliyoruz
  
        // Güncelleme işlemi
        await saleService.updateSale(editingSale.id, values); // saleId'yi gönderiyoruz
        message.success("Satış başarıyla güncellendi!");
      } else {
        await saleService.addSale(values);
        message.success("Yeni satış başarıyla eklendi!");
      }
  
      fetchSales();
      setIsModalOpen(false);
    } catch (error) {
      message.error("İşlem sırasında bir hata oluştu!");
    }
  };

  const handleDelete = async () => {
    if (deletingSaleId === null) return;
    try {
      await saleService.deleteSale(deletingSaleId);
      message.success("Satış başarıyla silindi!");
      fetchSales();
    } catch (error) {
      message.error("Satış silinirken bir hata oluştu!");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingSaleId(null);
    }
  };

  const columns = [
    { title: "Ürün Adı", dataIndex: "productName", key: "productName" },
    { title: "Adet", dataIndex: "quantity", key: "quantity" },
    { title: "Toplam Fiyat", dataIndex: "totalPrice", key: "totalPrice", render: (text: any) => `${text} ₺` },
    {
      title: "Tarih Saat",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (text: string) => dayjs(text).locale("tr").format("dddd, DD. MM. YYYY HH:mm")
    },
    { title: "Fatura", dataIndex: "invoiceId", key: "invoiceId", render: (text: any) => text ? text : "Fatura Oluşturulmamış" },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: Sale) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          <Button onClick={() => handleEdit(record)} type="primary" style={{ marginRight: 8 }}>
            Güncelle
          </Button>
          <Button onClick={() => { setDeletingSaleId(record.id); setIsDeleteModalOpen(true); }} type="primary" danger className="delete-button">
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
          Yeni Satış Ekle
        </Button>
        <DatePicker.RangePicker
          style={{ marginLeft: 10 }}
          format="YYYY-MM-DD HH:mm"
          showTime
          value={filterDate}
          onChange={(dates) => setFilterDate(dates as [Dayjs | null, Dayjs | null])}
          placeholder={['Başlangıç Tarihi', 'Bitiş Tarihi']}
        />
        <Button type="primary" danger onClick={() => setFilterDate([null, null])} style={{ marginLeft: 10 }}>Filtrelemeyi Kaldır</Button>

      </div>
      <Table dataSource={sales} columns={columns} rowKey="id" loading={loading} />
      <Modal title={editingSale ? "Satış Güncelle" : "Yeni Satış Ekle"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSave} okText="Kaydet" cancelText="İptal">
        <Form form={form} layout="vertical">
        <Form.Item name="productId" label="Ürün" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
          <Select
            showSearch
            placeholder="Ürün Seçin"
            optionFilterProp="children"
            filterOption={(input, option) => {
            if (!option?.children) return false;  // children yoksa false döndür
            return option?.children.toString().toLowerCase().includes(input.toLowerCase());}}
            >
            {products.map((product) => (
            <Select.Option key={product.id} value={product.id}>
            {product.name}
            </Select.Option>))}
          </Select>
        </Form.Item>
          <Form.Item name="quantity" label="Adet" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="totalPrice" label="Toplam Fiyat" rules={[{ required: true, message: "Bu alan zorunludur!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="saleDate" label="Satış Tarihi">
            <DatePicker showTime format="DD-MM-YYYY HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal 
        title="Satışı Sil!" 
        open={isDeleteModalOpen} 
        onOk={handleDelete} 
        onCancel={() => setIsDeleteModalOpen(false)} 
        okText="Evet, Sil" 
        cancelText="İptal"
      >
        <p>Bu satış işlemini silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
};

export default SaleManagement;
