
import { Routes, Route } from 'react-router-dom'
import './App.css'
// Contexts
import { AuthProvider } from './contexts/AuthContext'
// General Layouts & Pages
import UserLayout from './layouts/UserLayout'
import Home from './pages/General/Home'
import DoctorsPage from './pages/General/Doctors'
import About from './pages/General/About'
import Contact from './pages/General/Contact'
import DoctorProfileView from './components/Doctor/DoctorProfileView'
// Admin Pages & Layouts
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import MedicineManagement from './pages/Admin/MedicineManagement'
import ServiceManagement from './pages/Admin/ServiceManagement'
import RegisterPage from './pages/Auth/Register'
import AccountManagement from './pages/Admin/AccountManagement'
import InvoiceManagement from './pages/Admin/InvoiceManagement'
import RoleManagement from './pages/Admin/RoleManagement'
import DoctorSchedule from './pages/Admin/DoctorSchedule'
import ScheduleManagement from './pages/Admin/ScheduleManagement'
// Doctor Pages & Layouts
import DoctorLayout from './layouts/DoctorLayout'
import DoctorAppointment from './pages/Doctor/DoctorAppointment'
import DoctorTreatment from './pages/Doctor/DoctorTreatment'
// Patient Pages & Layouts
import PatientLayout from './layouts/PatientLayout'
import PatientProfile from './pages/Patient/PatientProfile'
import PatientAppointmentDoctor from './pages/Patient/PatientAppointmentDoctor'
import PatientAppointment from './pages/Patient/PatientAppointment'
import PatientTreatmentHistory from './pages/Patient/PatientTreatmentHistory'
import PatientAppointmentSpecialty from './pages/Patient/PatientAppointmentSpecialty'
import PaymentResult from './components/Receptionist/PaymentResult'
import Chat from './pages/Patient/AIChatBot'
// Receptionist Pages & Layouts
import ReceptionistLayout from './layouts/ReceptionistLayout'
import ReceptionistProfile from './pages/Receptionist/ReceptionistProfile'
import ReceptionistAppointment from './pages/Receptionist/ReceptionistAppointment'
import ReceptionistManageAppointment from './pages/Receptionist/ReceptionistManageAppoinment'
import ReceptionistInvoice from './pages/Receptionist/ReceptionistInvoice'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import HealthProfile from './pages/Patient/HealthProfile'
import LoginPage from './pages/Auth/LoginPage'
import ForgotEmail from './pages/Auth/ForgotEmail'
import VerifyOtp from './pages/Auth/VerifyOtp'
import ResetPassword from './pages/Auth/ResetPassword'
import ProtectedRoute from './components/ProtectedRoutes'
import SpecialtyManagement from './pages/Admin/SpecialtyManagement'


function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path='doctors' element={<DoctorsPage />} />
          <Route path='doctors/:doctorId' element={<DoctorProfileView />} />
          <Route path='about' element={<About />} />
          <Route path='contact' element={<Contact />} />
          <Route path='chat' element={<Chat />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/forgot" element={<ForgotEmail />} />
          <Route path="/auth/forgot/verify" element={<VerifyOtp />} />
          <Route path="/auth/forgot/reset" element={<ResetPassword />} />
        </ Route>

        <Route path='admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path='medicines' element={<MedicineManagement />} />
          <Route path='services' element={<ServiceManagement />} />
          <Route path='roles' element={<RoleManagement />} />
          <Route path='invoices' element={<InvoiceManagement />} />
          <Route path='users' element={<AccountManagement />} />
          <Route path='doctor-schedule' element={<DoctorSchedule />} />
          <Route path='doctor-schedule/:doctorId' element={<ScheduleManagement />} />
          <Route path='specialties' element={<SpecialtyManagement />} />
        </Route>

        <Route path='doctor' element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DoctorProfile />} />
          <Route path='treatments' element={<DoctorTreatment />} />
          <Route path='appointments' element={<DoctorAppointment />} />
        </Route>

        <Route path='patient' element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PatientProfile />} />
          <Route path='appointments' element={<PatientAppointment />} />
          <Route path='appointments-specialty' element={<PatientAppointmentSpecialty />} />
          <Route path='appointments-doctor' element={<PatientAppointmentDoctor />} />
          <Route path='medical-records' element={<PatientTreatmentHistory />} />
          
          <Route path='chatbot' element={<Chat />} />
          <Route path='health-profile' element={<HealthProfile />} />
        </Route>

        <Route path='receptionist' element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ReceptionistLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ReceptionistProfile />} />
          <Route path='assignments' element={<ReceptionistAppointment />} />
          <Route path='appointments' element={<ReceptionistManageAppointment />} />
          <Route path='invoices' element={<ReceptionistInvoice />} />
          <Route path='payment-result' element={<PaymentResult />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
