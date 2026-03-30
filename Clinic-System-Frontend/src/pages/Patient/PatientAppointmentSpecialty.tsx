import { message, Steps, Typography } from "antd";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCalendarCheck, FaUserCheck, FaUserMd } from "react-icons/fa";
import ChooseSpecialty from "../../components/Patient/AppointmentSpecialty/ChooseSpecialty";
import ChooseDateAndTime from "../../components/Patient/AppointmentSpecialty/ChooseDateAndTime";
import { type Patient, getPatientByAccountId } from "../../services/PatientService";
import ChooseHealthProfile from "../../components/Patient/AppointmentSpecialty/ChooseHealthProfile";
import ConfirmAppointment from "../../components/Patient/AppointmentSpecialty/ConfirmAppointment";
import { getSpecialtyById } from "../../services/SpecialtyService";
import SuccessScreen from "../../components/Patient/AppointmentSpecialty/SucessScreen";
import { useAuth } from "../../contexts/AuthContext";
import type { HealthProfile } from "../../services/HealthProfileService";
import { CacheService } from "../../services/CacheService";

const { Title } = Typography;

const APPOINTMENT_STEPS = [
    {
        title: 'Chuyên khoa',
        icon: <FaUserMd />,
        description: 'Chọn chuyên khoa khám'
    },
    {
        title: 'Thời gian & Ca khám',
        icon: <FaCalendarAlt />,
        description: 'Chọn ngày và giờ khám'
    },
    {
        title: 'Thông tin cá nhân',
        icon: <FaUserCheck />,
        description: 'Chọn hồ sơ sức khỏe'
    },
    {
        title: 'Xác nhận',
        icon: <FaCalendarCheck />,
        description: 'Hoàn tất đặt lịch'
    },
];

interface SelectedSpecialty {
    id: string;
    name: string;
}

export interface SelectedProfile extends HealthProfile {
    displayName?: string;
    displayPhone?: string;
}

const PatientAppointmentSpecialty = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedSpecialty, setSelectedSpecialty] = useState<SelectedSpecialty | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; timeSlot: string } | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>(null);
    const [isAppointmentSuccess, setIsAppointmentSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);

    // Hàm lấy patient theo account id (account id = user.id)
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

    // Gọi để đảm bảo hàm được sử dụng và có thể tận dụng dữ liệu sau này
    useEffect(() => {
        void fetchPatientByAccountId();

    }, [user?.id]);

    // Hàm xử lý khi người dùng chọn chuyên khoa và chuyển sang bước tiếp theo
    const handleSpecialtySelected = async (specialtyId: string) => {
        setLoading(true);
        try {
            const cacheKey = `specialty_${specialtyId}`;
            
            // Check cache first
            let specialtyData = CacheService.get<any>(cacheKey);
            if (!specialtyData) {
                specialtyData = await getSpecialtyById(specialtyId);
                if (specialtyData) {
                    CacheService.set(cacheKey, specialtyData);
                }
            }

            if (specialtyData && specialtyData.name) {
                setSelectedSpecialty({
                    id: specialtyId,
                    name: specialtyData.name
                });
                setCurrentStep(1);
            } else {
                message.error("Không thể lấy thông tin tên chuyên khoa.");
            }
        } catch (error) {
            console.error("Lỗi khi fetch Specialty Name:", error);
            message.error("Lỗi hệ thống khi tải thông tin chuyên khoa.");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeSlotSelected = (date: string, timeSlot: string) => {
        setSelectedDateTime({ date, timeSlot });
        setCurrentStep(2);
    };

    const handleProfileSelected = (profile: HealthProfile) => {

        // normalize name / phone
        if (profile.type === "FamilyMember") {
            setSelectedProfile({
                ...profile,
                displayName: profile.familyMemberName,
                displayPhone: profile.familyMemberPhone
            });
        } else {
            // type = Patient
            // lấy từ bên patient data global (đã fetch từ account id trước đó)
            // patient data nằm ở fetchPatientByAccountId
            setSelectedProfile({
                ...profile,
                displayName: patient?.name,
                displayPhone: patient?.phone
            });
        }

        setCurrentStep(3);
    };

    const handleAppointmentSuccess = () => {
        setIsAppointmentSuccess(true);
        setCurrentStep(4);
    };

    // Hàm render nội dung bước hiện tại
    const renderStepContent = () => {
        if (isAppointmentSuccess && selectedSpecialty && selectedDateTime && selectedProfile) {
            // RENDER MÀN HÌNH THÀNH CÔNG 
            return (
                <SuccessScreen
                    appointmentInfo={{
                        specialtyName: selectedSpecialty.name,
                        date: selectedDateTime.date,
                        timeSlot: selectedDateTime.timeSlot,
                        patientName: selectedProfile.displayName ?? "Người khám"
                    }}
                />
            );
        }

        switch (currentStep) {
            case 0:
                return (
                    <ChooseSpecialty
                        onNext={handleSpecialtySelected}
                        selectedSpecialtyId={selectedSpecialty?.id || null}
                    />
                );
            case 1:
                if (loading || !selectedSpecialty) return <div>Vui lòng quay lại Bước 1 để chọn Chuyên khoa.</div>;
                return (
                    <ChooseDateAndTime
                        specialtyId={selectedSpecialty.id}
                        onNext={handleTimeSlotSelected}
                        onBack={() => setCurrentStep(0)}
                    />
                );
            case 2:
                if (loading || !selectedSpecialty || !selectedDateTime) return <div>Dữ liệu thiếu. Vui lòng quay lại.</div>;

                return (
                    <ChooseHealthProfile
                        specialtyId={selectedSpecialty.id}
                        date={selectedDateTime.date}
                        timeSlot={selectedDateTime.timeSlot}
                        specialtyName={selectedSpecialty.name}
                        patientId={patient?._id || ""}
                        onNext={handleProfileSelected}
                        onBack={() => setCurrentStep(1)}
                    />
                );
            case 3:
                if (loading || !selectedSpecialty || !selectedDateTime || !selectedProfile) return <div>Dữ liệu thiếu. Vui lòng quay lại.</div>;

                return (
                    <ConfirmAppointment
                        specialtyId={selectedSpecialty.id}
                        dateTime={selectedDateTime}
                        profile={selectedProfile}
                        specialtyName={selectedSpecialty.name}
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
            <Title level={2} className="text-center !mb-3 sm:!mb-4 md:!mb-6 !font-bold text-lg sm:text-xl md:text-2xl">Đặt Lịch Khám Theo Chuyên Khoa</Title>

            {/* Steps Component: Hiển thị tiến trình */}
            <div className="mb-4 sm:mb-6 md:mb-8">
                <Steps 
                    current={currentStep} 
                    items={APPOINTMENT_STEPS}
                    className="text-xs sm:text-sm"
                />
            </div>

            {/* Nội dung của bước hiện tại */}
            <div className="bg-white p-3 sm:p-4 md:p-6 shadow-md rounded-lg">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default PatientAppointmentSpecialty;