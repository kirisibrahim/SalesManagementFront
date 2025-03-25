import { Layout, Menu, theme, Spin, Dropdown, Avatar, Typography, message } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  FileDoneOutlined,
  ProductOutlined,
  DollarOutlined,
  SolutionOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/AdminLayout.css";
import { getUserInfo } from '../services/authService';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setUsername(userInfo.username);
        setRole(userInfo.roleName);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        message.error("Kullanıcı bilgileri yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleProfile = ({ key }: { key: string }) => {
    if (key === "logout") {
      sessionStorage.removeItem("token");
      navigate("/login");
    } else {
      navigate(key);
    }
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    // rollere göre gösterme
    ...(role === "Admin"
      ? [{ key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" }]
      : []),
    // Sadece admin ise Kullanıcı ve Rol yönetimi göster
    ...(role === "Admin"
      ? [{
          key: "/UserManagement",
          icon: <UserOutlined />,
          label: "Kullanıcı Yönetimi",
          children: [
            { key: '/ManageUser', label: 'Kullanıcı Yönetimi' },
            { key: '/ManageRoles', label: 'Rol Yönetimi' },
          ],
        }]
      : []),
      ...(role === "Admin"
        ? [{ key: "/TaskManagement", icon: <SolutionOutlined />, label: "Görev Yönetimi" }]
        : []),
        ...(role === "Admin"
          ? [{ key: "/Sales", icon: <DollarOutlined />, label: "Satışlar" }]
          : []),
          ...(role === "Admin"
            ? [{ key: "/Invoice", icon: <FileDoneOutlined />, label: "Faturalar" }]
            : []),
    // Tüm kullanıcılara gösterme
    {
      key: "/ProductManagement",
      icon: <ProductOutlined />,
      label: "Ürün Yönetimi",
      children: [
        { key: '/ManageProduct', label: 'Ürün Yönetimi' },
        { key: '/ManageCategory', label: 'Kategori Yönetimi' },
        { key: '/ManageSupplier', label: 'Tedarikçi Yönetimi' },
      ],
    },
    { key: "/ManageCustomer", icon: <SmileOutlined />, label: "Müşteri Yönetimi" }
  ];

  return (
    <Layout className="layoutstyle">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="admin-logo">{collapsed ? "SM" : "Sales Management"}</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          onClick={({ key }) => { navigate(key); }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header className="admin-header" style={{ background: colorBgContainer }}>
          <span className="menu-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <div className="profilecss">
            <Dropdown overlay={
              <Menu onClick={handleProfile}>
                <Menu.Item key="/Profile" icon={<UserOutlined />}>Profilim</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="/MyTasks" icon={<FileDoneOutlined />}>Görevlerim</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="logout" icon={<LogoutOutlined />}>Çıkış Yap</Menu.Item>
              </Menu>
            } trigger={["click"]} placement="bottomLeft">
              <Avatar size={50} icon={<UserOutlined />} style={{ cursor: "pointer" }} />
            </Dropdown>
            <div className="userinfo">
              <Typography.Text>
                {loading ? <Spin /> : (username ? role : 'Rol')}
              </Typography.Text>
              <Typography.Text>
                {loading ? <Spin /> : (username ? username : 'Kullanıcı Adı')}
              </Typography.Text>
            </div>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
