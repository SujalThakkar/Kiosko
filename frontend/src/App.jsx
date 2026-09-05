import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import StudentOverview from "./pages/student/StudentOverview";
import StudentRequest from "./pages/student/StudentRequest";
import StudentHistory from "./pages/student/StudentHistory";

import ProfessorOverview from "./pages/professor/ProfessorOverview";
import ProfessorRequests from "./pages/professor/ProfessorRequests";
import ProfessorUsage from "./pages/professor/ProfessorUsage";

import LabOverview from "./pages/lab/LabOverview";
import LabApprovals from "./pages/lab/LabApprovals";
import LabKioskFeed from "./pages/lab/LabKioskFeed";
import LabInventory from "./pages/lab/LabInventory";
import LabStudents from "./pages/lab/LabStudents";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentOverview />} />
        <Route path="request" element={<StudentRequest />} />
        <Route path="history" element={<StudentHistory />} />
      </Route>

      <Route
        path="/professor"
        element={
          <ProtectedRoute role="professor">
            <DashboardLayout role="professor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfessorOverview />} />
        <Route path="requests" element={<ProfessorRequests />} />
        <Route path="usage" element={<ProfessorUsage />} />
      </Route>

      <Route
        path="/lab-assistant"
        element={
          <ProtectedRoute role="lab_assistant">
            <DashboardLayout role="lab_assistant" />
          </ProtectedRoute>
        }
      >
        <Route index element={<LabOverview />} />
        <Route path="approvals" element={<LabApprovals />} />
        <Route path="kiosk" element={<LabKioskFeed />} />
        <Route path="inventory" element={<LabInventory />} />
        <Route path="students" element={<LabStudents />} />
      </Route>
    </Routes>
  );
}
