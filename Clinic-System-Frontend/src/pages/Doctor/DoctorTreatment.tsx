import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import AppointmentList from "../../components/Doctor/DoctorTreatment/AppointmentList";
import PatientPreCheck from "../../components/Doctor/DoctorTreatment/PatientPreCheck";
import CreateLabOrder from "../../components/Doctor/DoctorTreatment/CreateLabOrder";
import CreatePrescription from "../../components/Doctor/DoctorTreatment/CreatePrescription";
import { message } from "antd";
import { createTreatment, type CreateTreatmentDto } from "../../services/TreatmentService";
import moment, { type Moment } from 'moment';

const DoctorTreatment = () => {
    const { user } = useAuth();
    const [doctorId, setDoctorId] = useState<string>("");
    const [screen, setScreen] = useState<"list" | "precheck" | "createLabOrder" | "prescription">("list");
    const [precheckData, setPrecheckData] = useState({
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        symptoms: "",
        diagnosis: "",
    });    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [currentLabOrderId, setCurrentLabOrderId] = useState<string | null>(null);
    const [currentLabOrderData, setCurrentLabOrderData] = useState<any>(null);
    const [currentPrescriptionId, setCurrentPrescriptionId] = useState<string | null>(null);
    const [currentPrescriptionData, setCurrentPrescriptionData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleDoctorIdChange = (id: string) => {
        setDoctorId(id);
    };    
    const goPreCheck = (appointment: any) => {        
        setSelectedAppointment(appointment);
        
        // Lấy doctorId từ appointment
        // Appointment có doctor_id field (ObjectId) và doctor/doctorSnapshot (snapshot data)
        let docId = appointment.doctor_id; // Ưu tiên lấy ID thực
        
        // Nếu doctor_id là object, lấy _id
        if (typeof docId === 'object' && docId?._id) {
            docId = docId._id;
        }
        
        console.log("Setting doctorId:", docId, "from appointment:", appointment);
        
        if (docId) {
            setDoctorId(docId);
        }
        
        setCurrentLabOrderId(null);
        setCurrentLabOrderData(null);
        setCurrentPrescriptionId(null);
        setCurrentPrescriptionData(null);
        setPrecheckData({
            bloodPressure: "",
            heartRate: "",
            temperature: "",        
            symptoms: "",
            diagnosis: "",
        });
        setScreen("precheck");
    }

    const goBackToPreCheck = () => {
        setScreen("precheck");
    }

    const goLabOrder = () => {
        console.log("goLabOrder called", { selectedAppointment, doctorId });
        setScreen("createLabOrder");
    }

    const goPrescription = () => {
        console.log("goPrescription called", { selectedAppointment, doctorId });
        setScreen("prescription");
    }

    const goBackToList = () => {
        setSelectedAppointment(null);
        setCurrentLabOrderId(null);
        setCurrentLabOrderData(null);
        setCurrentPrescriptionId(null);
        setCurrentPrescriptionData(null);
        setScreen("list");
    }

    const handleLabOrderCreated = (labOrderId: string, labOrderData: any) => {
        setCurrentLabOrderId(labOrderId);
        setCurrentLabOrderData(labOrderData);
        setScreen("precheck");
    }

    const handlePrescriptionCreated = (prescriptionId: string, prescriptionData: any) => {
        setCurrentPrescriptionId(prescriptionId);
        setCurrentPrescriptionData(prescriptionData);
        setScreen("precheck");
    }

    const handleSaveTreatment = async () => {
        if (!selectedAppointment || !doctorId) {
            message.error("Thiếu thông tin cần thiết để lưu ca khám.");
            return;
        }

        // Handle both string ID and populated object
        const healthProfileId = typeof selectedAppointment.healthProfile_id === 'object'
            ? selectedAppointment.healthProfile_id._id
            : selectedAppointment.healthProfile_id;
        const appointmentId = selectedAppointment._id;
        const date = moment() as Moment;

        // Xây dựng Payload
        const payload: CreateTreatmentDto = {
            healthProfile: healthProfileId,
            doctor: doctorId,
            appointment: appointmentId,
            treatmentDate: date ? moment.utc(date.format('YYYY-MM-DD')).toISOString() : undefined,

            // Dữ liệu từ Precheck
            diagnosis: precheckData.diagnosis,
            bloodPressure: precheckData.bloodPressure,
            heartRate: parseInt(precheckData.heartRate) || 0,
            temperature: parseFloat(precheckData.temperature) || 0,
            symptoms: precheckData.symptoms,

            // ID tùy chọn
            prescription: currentPrescriptionId,
            laborder: currentLabOrderId,
        };

        try {
            setIsSaving(true);
            await createTreatment(payload);

            message.success("Lưu Ca Khám và hoàn tất điều trị thành công!");

            goBackToList();

        } catch (error) {
            console.error("Lỗi khi tạo Treatment:", error);
            message.error(" Lưu ca khám thất bại. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSaving(false);
        }
    }

    if (!user?.id) return <div className="p-4">Loading user info...</div>;

    return (
        <div className="p-4">
            {screen === "list" && (
                <AppointmentList
                    accountId={user.id}
                    onSelect={goPreCheck}
                    onDoctorIdChange={handleDoctorIdChange}
                />
            )}            {screen === "precheck" && selectedAppointment && (
                <PatientPreCheck
                    appointment={selectedAppointment}
                    precheckData={precheckData}
                    onPrecheckDataChange={setPrecheckData}

                    onCreateLabOrder={goLabOrder}
                    onGotoPrescription={goPrescription}
                    isSaving={isSaving}
                    onSaveTreatment={handleSaveTreatment}
                    onBack={goBackToList}

                    currentLabOrderId={currentLabOrderId}
                    currentLabOrderData={currentLabOrderData}
                    currentPrescriptionId={currentPrescriptionId}
                    currentPrescriptionData={currentPrescriptionData}
                />
            )}
            {screen === "createLabOrder" && selectedAppointment && (
                <CreateLabOrder
                    healthProfileId={
                        typeof selectedAppointment.healthProfile_id === 'object'
                            ? selectedAppointment.healthProfile_id._id
                            : selectedAppointment.healthProfile_id
                    }
                    onCreated={handleLabOrderCreated}
                    onBack={goBackToPreCheck}
                />
            )}

            {screen === "prescription" && selectedAppointment && (
                <CreatePrescription
                    healthProfileId={
                        typeof selectedAppointment.healthProfile_id === 'object'
                            ? selectedAppointment.healthProfile_id._id
                            : selectedAppointment.healthProfile_id
                    }
                    onCreated={handlePrescriptionCreated}
                    onBack={goBackToPreCheck}
                />
            )}
        </div>
    );
}

export default DoctorTreatment;
