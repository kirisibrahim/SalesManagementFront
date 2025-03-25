import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, message, Spin } from "antd";
import userService from "../services/userService";
import { getUserInfo } from "../services/authService";

const { Title } = Typography;

const Profile = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState<{ id: number; username: string; roleName: string; roleId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setUser({
          id: Number(userInfo.userId),
          username: userInfo.username,
          roleName: userInfo.roleName,
          roleId: Number(userInfo.roleId),
        });

        form.setFieldsValue({ username: userInfo.username });
      } catch (error) {
        message.error("Kullanıcı bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [form]);

  const handleUpdatePassword = async (values: { passwordHash: string }) => {
    if (!user) return;
    setUpdating(true);
    try {
      await userService.updateUser(user.id, {
        username: user.username,
        passwordHash: values.passwordHash,
        roleId: user.roleId,
      });
      message.success("Şifre başarıyla güncellendi.");
      form.resetFields(["passwordhash"]);
    } catch (error) {
      message.error("Şifre güncellenirken hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  return (
    <Card title="Profilim" style={{ maxWidth: 400, margin: "50px auto" }}>
      <Title level={4}>Kullanıcı Bilgileri</Title>
      <p><strong>Kullanıcı Adı:</strong> {user?.username}</p>
      <p><strong>Rol:</strong> {user?.roleName}</p>

      <Form form={form} layout="vertical" onFinish={handleUpdatePassword}>
        <Form.Item
          label="Yeni Şifre"
          name="passwordhash"
          rules={[
            { required: true, message: "Lütfen yeni şifrenizi girin!" },
            { min: 6, message: "Şifre en az 6 karakter olmalıdır!" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={updating} block>
          Şifreyi Güncelle
        </Button>
      </Form>
    </Card>
  );
};

export default Profile;
