import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/UserManagement";
import Roles from "../pages/RoleManagement";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Tasks from "../pages/TaskManagement";
import MyTasks from "../pages/AssignedTasksPage";
import ProductManagement from "../pages/ProductManagement";
import SupplierManagement from "../pages/SupplierManagement";
import CategoryManagement from "../pages/CategoryManagement";
import Profile from "../pages/Profile";
import Sale from "../pages/SalesManagement";
import Invoice from "../pages/InvoiceManagement";
import Customer from "../pages/CustomerManagement"

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "ManageUser", element: <Users /> },
      { path: "settings", element: <Settings /> },
      { path: "ManageRoles", element: <Roles /> },
      { path: "TaskManagement", element: <Tasks /> },
      { path: "MyTasks", element: <MyTasks /> },
      { path: "ManageProduct", element: <ProductManagement /> },
      { path: "ManageSupplier", element: <SupplierManagement /> },
      { path: "ManageCategory", element: <CategoryManagement /> },
      { path: "Profile", element: <Profile /> },
      { path: "Sales", element: <Sale /> },
      { path: "Invoice", element: <Invoice /> },
      { path: "ManageCustomer", element: <Customer /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
