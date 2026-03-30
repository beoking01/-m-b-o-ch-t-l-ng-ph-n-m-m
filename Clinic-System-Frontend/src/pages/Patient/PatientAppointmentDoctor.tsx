import { message, Steps, Typography, Spin } from "antd";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCalendarCheck, FaUserCheck, FaUserMd } from "react-icons/fa";
import ChooseDoctor from "../../components/Patient/AppointmentDoctor/ChooseDoctor";
import ChooseDateAndTimeDoctor from "../../components/Patient/AppointmentDoctor/ChooseDateAndTime";
import ChooseHealthProfile from "../../components/Patient/AppointmentDoctor/ChooseHealthProfile";
import ConfirmAppointment from "../../components/Patient/AppointmentDoctor/ConfirmAppointment";
import SuccessScreen from "../../components/Patient/AppointmentDoctor/SucessScreen";
import { useAuth } from "../../contexts/AuthContext";
import { type Patient, getPatientByAccountId } from "../../services/PatientService";
import { getDoctorById } from "../../services/DoctorService";
import type { HealthProfile } from "../../services/HealthProfileService";
import { CacheService } from "../../services/CacheService";

const { Title } = Typography;

const APPOINTMENT_STEPS = [
    {
        title: "Bác sĩ",
        icon: <FaUserMd />,
        description: "Chọn bác sĩ muốn khám"
    },
    {
        title: "Thời gian & Ca khám",
        icon: <FaCalendarAlt />,
        description: "Chọn ngày và giờ khám"
    },
    {
        title: "Thông tin cá nhân",
        icon: <FaUserCheck />,
        description: "Chọn hồ sơ sức khỏe"
    },
    {
        title: "Xác nhận",
        icon: <FaCalendarCheck />,
        description: "Hoàn tất đặt lịch"
    }
];

export interface SelectedProfile extends HealthProfile {
    displayName?: string;
    displayPhone?: string;
}

interface SelectedDoctor {
    id: string;
    name: string;
    specialtyId?: string;
    specialtyName?: string;
}

const PatientAppointmentDoctor = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedDoctor, setSelectedDoctor] = useState<SelectedDoctor | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; timeSlot: string } | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>(null);
    const [isAppointmentSuccess, setIsAppointmentSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);

    // ✅ Hàm lấy Patient theo accountId
    const fetchPatientByAccountId = async (): Promise<Patient | null> => {
        const accountId = user?.id;
        if (!accountId) {
            message.error("Không tìm thấy tài khoản hiện tại.");
            return null;
        }
        try {
            const cacheKey = `patient_${accountId}`;
            
            // Check cache first
            let data = CacheService.get<Patient>(cacheKey);
            if (!data) {
                data = await getPatientByAccountId(accountId);
                if (data) {
                    CacheService.set(cacheKey, data);
                }
            }
            setPatient(data || null);
            return data;
        } catch (err) {
            console.error("Lỗi khi lấy hồ sơ bệnh nhân theo account id:", err);
            message.error("Không thể tải hồ sơ bệnh nhân. Vui lòng thử lại.");
            return null;
        }
    };

    // ✅ Gọi fetchPatientByAccountId khi có user
    useEffect(() => {
        void fetchPatientByAccountId();
    }, [user?.id]);

    // ✅ Khi chọn bác sĩ
    const handleDoctorSelected = async (doctorId: string) => {
        setLoading(true);
        try {
            const cacheKey = `doctor_${doctorId}`;
            
            // Check cache first
            let doctorData = CacheService.get<any>(cacheKey);
            if (!doctorData) {
                doctorData = await getDoctorById(doctorId);
                if (doctorData) {
                    CacheService.set(cacheKey, doctorData);
                }
            }

            if (doctorData) {
                setSelectedDoctor({
                    id: doctorId,
                    name: doctorData.name,
                    specialtyName: doctorData.specialtyId?.name ?? "Không rõ chuyên khoa"
                });
                setCurrentStep(1);
            } else {
                message.error("Không thể lấy thông tin bác sĩ.");
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin bác sĩ:", error);
            message.error("Lỗi hệ thống khi tải thông tin bác sĩ.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Khi chọn thời gian
    const handleTimeSlotSelected = (date: string, timeSlot: string) => {
        setSelectedDateTime({ date, timeSlot });
        setCurrentStep(2);
    };

    // ✅ Khi chọn hồ sơ sức khỏe
    const handleProfileSelected = (profile: HealthProfile) => {
        if (profile.type === "FamilyMember") {
            setSelectedProfile({
                ...profile,
                displayName: profile.familyMemberName,
                displayPhone: profile.familyMemberPhone
            });
        } else {
            setSelectedProfile({
                ...profile,
                displayName: patient?.name,
                displayPhone: patient?.phone
            });
        }

        setCurrentStep(3);
    };

    // ✅ Khi đặt lịch thành công
    const handleAppointmentSuccess = () => {
        setIsAppointmentSuccess(true);
        setCurrentStep(4);
    };

    // ✅ Render nội dung theo từng bước
    const renderStepContent = () => {
        if (isAppointmentSuccess && selectedDoctor && selectedDateTime && selectedProfile) {
            return (
                <SuccessScreen
                    appointmentInfo={{
                        specialtyName: selectedDoctor.specialtyName ?? "Không rõ chuyên khoa",
                        doctorName: selectedDoctor.name,
                        date: selectedDateTime.date,
                        timeSlot: selectedDateTime.timeSlot,
                        patientName: selectedProfile.displayName ?? "Người khám"
                    }}
                />
            );
        } switch (currentStep) {
            case 0:
                return (
                    <Spin spinning={loading} tip="Đang tải thông tin bác sĩ...">
                        <ChooseDoctor onNext={handleDoctorSelected} selectedDoctorId={selectedDoctor?.id || null} />
                    </Spin>
                );
            case 1:
                if (!selectedDoctor) return <div>Vui lòng chọn bác sĩ trước.</div>;
                return (
                    <ChooseDateAndTimeDoctor
                        doctorId={selectedDoctor.id}
                        onNext={handleTimeSlotSelected}
                        onBack={() => setCurrentStep(0)}
                    />
                );
            case 2:
                if (!selectedDoctor || !selectedDateTime)
                    return <div>Thiếu dữ liệu. Vui lòng quay lại bước trước.</div>;
                return (
                    <ChooseHealthProfile
                        specialtyId={selectedDoctor.id} // bác sĩ có thể mapping với chuyên khoa nội bộ
                        specialtyName={selectedDoctor.specialtyName ?? ""}
                        doctorId={selectedDoctor.id}
                        doctorName={selectedDoctor.name}
                        date={selectedDateTime.date}
                        timeSlot={selectedDateTime.timeSlot}
                        patientId={patient?._id || ""}
                        onNext={handleProfileSelected}
                        onBack={() => setCurrentStep(1)}
                    />
                );
            case 3:
                if (!selectedDoctor || !selectedDateTime || !selectedProfile)
                    return <div>Thiếu dữ liệu. Vui lòng quay lại.</div>;
                return (
                    <ConfirmAppointment
                        doctorId={selectedDoctor.id}
                        dateTime={selectedDateTime}
                        profile={selectedProfile}
                        doctorName={selectedDoctor.name}
                        specialtyName={selectedDoctor.specialtyName ?? ""}
                        patientId={patient?._id || ""}
                        displayName={selectedProfile.displayName}
                        displayPhone={selectedProfile.displayPhone}
                        onBack={() => setCurrentStep(2)}
                        onSuccess={handleAppointmentSuccess}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-2 sm:p-4 md:p-6 max-w-6xl">
            <Title level={2} className="text-center !mb-3 sm:!mb-4 md:!mb-6 !font-bold text-lg sm:text-xl md:text-2xl">
                Đặt Lịch Khám Theo Bác Sĩ
            </Title>            {/* Steps hiển thị tiến trình */}
            <div className="mb-4 sm:mb-6 md:mb-8">
                <Steps
                    current={currentStep}
                    items={APPOINTMENT_STEPS}
                    className={`text-xs sm:text-sm ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                />
            </div>

            {/* Nội dung của bước hiện tại */}
            <div className="bg-white p-3 sm:p-4 md:p-6 shadow-md rounded-lg">
                {loading && currentStep === 0 ? (
                    <div className="flex justify-center items-center py-10 sm:py-20">
                        <Spin size="large" tip="Đang xử lý thông tin bác sĩ..." />
                    </div>
                ) : (
                    renderStepContent()
                )}
            </div>
        </div>
    );
};

export default PatientAppointmentDoctor;
