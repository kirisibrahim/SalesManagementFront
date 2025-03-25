import "../../styles/login.css";
import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { motion } from "framer-motion";
import { login } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kullanıcı login olmuşsa, doğrudan dashboard'a yönlendir
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // Eğer token varsa dashboard'a yönlendir
    }
  }, [navigate]);

  const onFinish = async (values: { username: string, passwordhash: string }) => {
    setLoading(true);
    const { username, passwordhash } = values;

    try {
      const result = await login(username, passwordhash);
      if (result.success) {
        message.success('Giriş başarılı!');
        sessionStorage.setItem('token', result.token); // Token'ı sessionStorage kayıt
        navigate("/dashboard"); // Giriş başarılıysa yönlendir
      } else {
        message.error(result.message || 'Giriş başarısız!');
      }
    } catch (error) {
      message.error('Bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="login-card">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          >
            <Title level={2} className="login-title">Satış Yönetimi</Title>
          </motion.div>

          <Form layout="vertical" onFinish={onFinish} className="login-form">
            <motion.div 
              initial={{ x: -50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
            >
              <Form.Item 
                label="Kullanıcı Adı" 
                name="username" 
                rules={[{ required: true, message: "Lütfen kullanıcı adınızı girin!" }]}>
                <Input placeholder="Kullanıcı Adı" />
              </Form.Item>
            </motion.div>

            <motion.div 
              initial={{ x: 50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
            >
              <Form.Item 
                label="Şifre" 
                name="passwordhash" 
                rules={[{ required: true, message: "Lütfen şifrenizi girin!" }]}>
                <Input.Password placeholder="Şifre" />
              </Form.Item>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
            >
              <Button type="primary" htmlType="submit" block loading={loading}>
                Giriş Yap
              </Button>
            </motion.div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
