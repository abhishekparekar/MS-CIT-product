// src/routes/AppRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import FranchiseLayout from "../layouts/FranchiseLayout";
import StudentLayout from "../layouts/StudentLayout";

// Public Pages
import Home from "../pages/public/Home";
import Exam from "../pages/public/Exam";
import About from "../pages/public/About";
import Courses from "../pages/public/Courses";
import Gallery from "../pages/public/Gallery";
import DemoLectures from "../pages/public/DemoLectures";
import Affiliation from "../pages/public/TrainingCenterAffiliation";
import Certificates from "../pages/public/Certificates";
import ApplyNow from "../pages/public/ApplyNow";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import TestimonialsPage from "../pages/public/TestimonialsPage";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMessages from "../pages/admin/AdminMessages";
import GalleryUpload from "../pages/admin/GalleryUpload";
import FranchiseForm from "../pages/admin/FranchiseForm";
import FranchiseList from "../pages/admin/FranchiseList";
import AdminExamForm from "../pages/admin/Forms/ExamForm";
import AdminCertificateForm from "../pages/admin/Forms/CertificateForm";
import AdminMarksheetForm from "../pages/admin/Forms/MarksheetForm";
import AdminHallTicket from "../pages/admin/Downloads/HallTicket";
import AdminCertificateDownload from "../pages/admin/Downloads/CertificateDownload";
import AdminMarksheetDownload from "../pages/admin/Downloads/MarksheetDownload";
import AdminApprovedStudents from "../pages/admin/Students/ApprovedStudents";
import AffiliationList from "../pages/admin/Students/AffiliationList";
import ApprovedAffiliation from "../pages/admin/Students/ApprovedAffiliation";
import Payments from "../pages/admin/Students/Payments";
import AdminResults from "../pages/admin/Students/Results";
import FranchiseStudentFees from "../pages/admin/FranchiseStudentFees";
import FranchiseFees from "../pages/admin/FranchiseFees";

// Franchise Pages
import FranchiseDashboard from "../pages/franchise/FranchiseDashboard";
import ApplicationForm from "../pages/franchise/ApplicationForm";
import Fees from "../pages/franchise/Fees";
import FranchiseMessages from "../pages/franchise/FranchiseMessages";
import Coaching from "../pages/franchise/Coaching";
import FranchiseExamForm from "../pages/franchise/Forms/ExamForm";
import CreateCertificate from "../pages/franchise/Forms/CreateCertificate";
import CreateMarksheet from "../pages/franchise/Forms/CreateMarksheet";
import CreateHallTicket from "../pages/franchise/Forms/CreateHallTicket";
import FranchiseHallTicket from "../pages/franchise/Downloads/HallTicket";
import FranchiseCertificateDownload from "../pages/franchise/Downloads/CertificateDownload";
import FranchiseMarksheetDownload from "../pages/franchise/Downloads/MarksheetDownload";
import FranchiseApprovedStudents from "../pages/franchise/Students/ApprovedStudents";
import PassedStudents from "../pages/franchise/Students/PassedStudents";
import FranchiseCertificates from "../pages/franchise/Students/Certificates";
import FranchiseResults from "../pages/franchise/Students/Results";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import Receipt from "../pages/student/Receipt";
import Profile from "../pages/student/Profile";
import StudentExam from "../pages/student/Exam";
import EditProfile from "../pages/student/EditProfile";

// Error Pages
import NotFound from "../pages/error/NotFound";
import Unauthorized from "../pages/error/Unauthorized";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/exam"
        element={
          <PublicLayout>
            <Exam />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/courses"
        element={
          <PublicLayout>
            <Courses />
          </PublicLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <Gallery />
          </PublicLayout>
        }
      />
      <Route
        path="/testimonials"
        element={
          <PublicLayout>
            <TestimonialsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/demo-lectures"
        element={
          <PublicLayout>
            <DemoLectures />
          </PublicLayout>
        }
      />
      <Route
        path="/affiliation"
        element={
          <PublicLayout>
            <Affiliation />
          </PublicLayout>
        }
      />
      <Route
        path="/certificates"
        element={
          <PublicLayout>
            <Certificates />
          </PublicLayout>
        }
      />
      <Route
        path="/apply-now"
        element={
          <PublicLayout>
            <ApplyNow />
          </PublicLayout>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="gallery-upload" element={<GalleryUpload />} />
                <Route path="add-franchise" element={<FranchiseForm />} />
                <Route path="franchise-list" element={<FranchiseList />} />
                <Route path="franchise-fees" element={<FranchiseFees />} />
                <Route
                  path="franchise-student-fees"
                  element={<FranchiseStudentFees />}
                />
                <Route path="forms/exam" element={<AdminExamForm />} />
                <Route path="forms/certificate" element={<AdminCertificateForm />} />
                <Route path="forms/marksheet" element={<AdminMarksheetForm />} />
                <Route path="downloads/hall-ticket" element={<AdminHallTicket />} />
                <Route
                  path="downloads/certificate"
                  element={<AdminCertificateDownload />}
                />
                <Route
                  path="downloads/marksheet"
                  element={<AdminMarksheetDownload />}
                />
                <Route path="students/approved" element={<AdminApprovedStudents />} />
                <Route path="students/affiliation-list" element={<AffiliationList />} />
                <Route
                  path="students/approved-affiliation"
                  element={<ApprovedAffiliation />}
                />
                <Route path="students/payments" element={<Payments />} />
                <Route path="students/results" element={<AdminResults />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= FRANCHISE ROUTES ================= */}
      <Route
        path="/franchise/*"
        element={
          <ProtectedRoute allowedRoles={["franchise"]}>
            <FranchiseLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<FranchiseDashboard />} />
                <Route path="application-form" element={<ApplicationForm />} />
                <Route path="fees" element={<Fees />} />
                <Route path="coaching" element={<Coaching />} />
                <Route path="messages" element={<FranchiseMessages />} />
                <Route path="forms/exam" element={<FranchiseExamForm />} />
                <Route path="forms/hall-ticket" element={<CreateHallTicket />} />
                <Route path="forms/certificate" element={<CreateCertificate />} />
                <Route path="forms/marksheet" element={<CreateMarksheet />} />
                <Route path="downloads/hall-ticket" element={<FranchiseHallTicket />} />
                <Route
                  path="downloads/certificate"
                  element={<FranchiseCertificateDownload />}
                />
                <Route
                  path="downloads/marksheet"
                  element={<FranchiseMarksheetDownload />}
                />
                <Route
                  path="students/approved"
                  element={<FranchiseApprovedStudents />}
                />
                <Route path="students/passed" element={<PassedStudents />} />
                <Route
                  path="students/certificates"
                  element={<FranchiseCertificates />}
                />
                <Route path="students/results" element={<FranchiseResults />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </FranchiseLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= STUDENT ROUTES ================= */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="receipt" element={<Receipt />} />
                <Route path="profile" element={<Profile />} />
                <Route path="exam" element={<StudentExam />} />
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route
        path="/unauthorized"
        element={
          <PublicLayout>
            <Unauthorized />
          </PublicLayout>
        }
      />
      <Route
        path="/404"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />

      {/* Shortcuts */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/franchise"
        element={<Navigate to="/franchise/dashboard" replace />}
      />
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
