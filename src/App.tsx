// src/App.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Digitization from "./pages/Digitization";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import ClientRegister from "./pages/ClientRegistration";
import PlantRegister from "./pages/PlantRegister";
import { MainContent } from "./components/MainContent";
import HomePage from "./pages/Home";
import { DashboardLayout } from "./components/DashboardLayout"; // <-- Make sure to import this
import LogIn from "./pages/LogIn";
import RolesManagement from "./pages/RoleManagement";
import AddRole from "./pages/AddRole";
import UserManagement from "./pages/UserManagement";
import AddMemberPage from "./pages/AddMember";
import ProtectedRoute from "./components/ProtechtedRoute";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* The Index page becomes the default child route for the dashboard */}
      <Route path="/" element={<LogIn />} />{" "}
      {/*isse login file render ho rhi h*/}
      <Route path="/Dashboard" element={<DashboardLayout />} />{" "}
      {/*isse after sucessfull ye page dashboard ki render ho rhi h*/}
      <Route path="/" element={<ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>}>
        {" "}
        {/*yeha se dashboard layout ke andar chije hone wali h*/}
        {/* Your registration pages now render inside the DashboardLayout */}
        <Route path="HomePage" element={<HomePage />} />
        <Route path="client-registration" element={<ClientRegister />} />
        <Route path="plant-registration" element={<PlantRegister />} />
        <Route path="digitization" element={<Digitization />} />
        <Route path="library" element={<Library />} />
        <Route
          path="/management/roles-management"
          element={<RolesManagement />}
        />
        <Route
          path="/management/user-management"
          element={<UserManagement />}
        />
        <Route path="/management/roles-management/add" element={<AddRole />} />
        <Route
          path="/management/user-management/add"
          element={<AddMemberPage />}
        />
      </Route>
      {/* Any other routes that do not need the dashboard layout go here */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
