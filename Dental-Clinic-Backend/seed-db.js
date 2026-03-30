require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const Account = require('./src/models/account');
const Role = require('./src/models/role');
const Admin = require('./src/models/admin');
const Doctor = require('./src/models/doctor');
const Patient = require('./src/models/patient');
const Receptionist = require('./src/models/receptionist');
const Specialty = require('./src/models/specialty');
const Service = require('./src/models/service');
const Medicine = require('./src/models/medicine');
const Schedule = require('./src/models/schedule');
const Appointment = require('./src/models/appointment');
const HealthProfile = require('./src/models/healthProfile');
const Treatment = require('./src/models/treatment');
const Prescription = require('./src/models/prescription');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding complete database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Account.deleteMany({}),
      Role.deleteMany({}),
      Admin.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Receptionist.deleteMany({}),
      Specialty.deleteMany({}),
      Service.deleteMany({}),
      Medicine.deleteMany({}),
      Schedule.deleteMany({}),
      Appointment.deleteMany({}),
      HealthProfile.deleteMany({}),
      Treatment.deleteMany({}),
      Prescription.deleteMany({}),
    ]);

    // Create roles
    console.log('👥 Creating roles...');
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator',
      permissions: [
        { module: 'appointment', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'patient', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'doctor', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'schedule', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'invoice', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'role', actions: ['create', 'read', 'update', 'delete'] },
      ],
    });
    const doctorRole = await Role.create({
      name: 'doctor',
      description: 'Doctor',
      permissions: [
        { module: 'appointment', actions: ['read', 'update'] },
        { module: 'healthprofile', actions: ['read'] },
      ],
    });
    const patientRole = await Role.create({
      name: 'patient',
      description: 'Patient',
      permissions: [
        { module: 'appointment', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'healthprofile', actions: ['read', 'update'] },
        { module: 'patient', actions: ['read', 'update'] },
      ],
    });
    const receptionistRole = await Role.create({
      name: 'receptionist',
      description: 'Receptionist',
      permissions: [
        { module: 'appointment', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'schedule', actions: ['read', 'update'] },
      ],
    });

    // Create admin account
    console.log('👨‍💼 Creating admin account...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminAccount = await Account.create({
      email: 'admin@healthcare.vn',
      password: hashedAdminPassword,
      roleId: adminRole._id,
      status: 'active'
    });

    // Create admin profile
    await Admin.create({
      accountId: adminAccount._id,
      name: 'System Admin',
      phone: '0123456789',
      address: '123 Admin Street',
      status: 'active'
    });

    // Create specialties
    console.log('🏥 Creating specialties...');
    const specialties = [
      { name: 'Da liễu', description: 'Điều trị các bệnh lý về da, tóc và móng.' },
      { name: 'Mắt', description: 'Chăm sóc và điều trị các bệnh lý về mắt và thị lực.' },
      { name: 'Nhi', description: 'Chăm sóc sức khỏe và điều trị các bệnh lý ở trẻ em.' },
      { name: 'Phụ khoa', description: 'Chăm sóc sức khỏe sinh sản và điều trị các bệnh lý phụ nữ.' },
      { name: 'Tai mũi họng', description: 'Chẩn đoán và điều trị các bệnh về tai, mũi và họng.' },
      { name: 'Thần kinh', description: 'Chẩn đoán và điều trị các rối loạn thần kinh và não bộ.' },
      { name: 'Tim mạch', description: 'Chăm sóc, chẩn đoán và điều trị các bệnh về tim và mạch máu.' },
      { name: 'Tâm thần', description: 'Chẩn đoán và điều trị các rối loạn tâm lý và tinh thần.' },
      { name: 'Y học tổng quát', description: 'Khám và điều trị các bệnh lý thông thường ở mọi đối tượng.' },
      { name: 'Cơ xương khớp', description: 'Chẩn đoán và điều trị các bệnh lý về xương khớp.' }
    ];
    const createdSpecialties = await Specialty.insertMany(specialties);

    // Create services
    console.log('🛠️ Creating services...');
    const services = [
      { name: 'Khám tổng quát', description: 'Khám răng miệng tổng quát', price: 100000, duration: 30 },
      { name: 'Lấy cao răng', description: 'Lấy cao răng siêu âm', price: 200000, duration: 45 },
      { name: 'Trám răng', description: 'Trám răng bằng composite', price: 300000, duration: 60 },
      { name: 'Nhổ răng', description: 'Nhổ răng thông thường', price: 150000, duration: 30 },
      { name: 'Tẩy trắng răng', description: 'Tẩy trắng răng tại phòng khám', price: 500000, duration: 90 },
      { name: 'Niềng răng mắc cài', description: 'Niềng răng bằng mắc cài kim loại', price: 15000000, duration: 120 },
      { name: 'Implant', description: 'Cấy ghép implant và mão răng', price: 8000000, duration: 180 }
    ];
    const createdServices = await Service.insertMany(services);

    // Create medicines
    console.log('💊 Creating medicines...');
    const medicines = [
      { name: 'Paracetamol', description: 'Thuốc giảm đau hạ sốt', unit: 'viên', price: 5000, quantity: 100, expiryDate: new Date('2025-12-31') },
      { name: 'Amoxicillin', description: 'Kháng sinh', unit: 'viên', price: 10000, quantity: 50, expiryDate: new Date('2025-10-15') },
      { name: 'Ibuprofen', description: 'Thuốc chống viêm', unit: 'viên', price: 8000, quantity: 75, expiryDate: new Date('2025-08-20') },
      { name: 'Chlorhexidine', description: 'Thuốc sát trùng', unit: 'chai', price: 25000, quantity: 20, expiryDate: new Date('2026-01-10') },
      { name: 'Lidocaine', description: 'Thuốc gây tê', unit: 'ống', price: 15000, quantity: 30, expiryDate: new Date('2025-06-30') },
      { name: 'Metronidazole', description: 'Kháng sinh trị nhiễm trùng', unit: 'viên', price: 12000, quantity: 40, expiryDate: new Date('2025-09-15') }
    ];
    const createdMedicines = await Medicine.insertMany(medicines);

    // Create doctor accounts
    console.log('👨‍⚕️ Creating doctor accounts...');
    const hashedDoctorPassword = await bcrypt.hash('doctor123', 10);
    const doctorAccounts = await Account.insertMany([
      { email: 'doctor1@healthcare.vn', password: hashedDoctorPassword, roleId: doctorRole._id, status: 'active' },
      { email: 'doctor2@healthcare.vn', password: hashedDoctorPassword, roleId: doctorRole._id, status: 'active' },
      { email: 'doctor3@healthcare.vn', password: hashedDoctorPassword, roleId: doctorRole._id, status: 'active' }
    ]);

    // Create doctor profiles
    const doctors = await Doctor.insertMany([
      {
        accountId: doctorAccounts[0]._id,
        name: 'Dr. Nguyễn Văn A',
        specialtyId: createdSpecialties[0]._id,
        phone: '0987654321',
        experience: 10,
        bio: 'Bác sĩ chuyên khoa nha khoa tổng quát với 10 năm kinh nghiệm'
      },
      {
        accountId: doctorAccounts[1]._id,
        name: 'Dr. Trần Thị B',
        specialtyId: createdSpecialties[1]._id,
        phone: '0987654322',
        experience: 8,
        bio: 'Chuyên gia nha khoa trẻ em, tâm huyết với sức khỏe răng miệng của trẻ'
      },
      {
        accountId: doctorAccounts[2]._id,
        name: 'Dr. Lê Văn C',
        specialtyId: createdSpecialties[2]._id,
        phone: '0987654323',
        experience: 12,
        bio: 'Bác sĩ phẫu thuật răng hàm mặt, chuyên sâu về implant và phẫu thuật'
      }
    ]);

    // Create receptionist account
    console.log('👩‍💼 Creating receptionist account...');
    const hashedReceptionistPassword = await bcrypt.hash('receptionist123', 10);
    const receptionistAccount = await Account.create({
      email: 'receptionist@healthcare.vn',
      password: hashedReceptionistPassword,
      roleId: receptionistRole._id,
      status: 'active'
    });

    // Create receptionist profile
    await Receptionist.create({
      accountId: receptionistAccount._id,
      name: 'Nguyễn Thị D',
      phone: '0987654324'
    });

    // Create patient accounts
    console.log('👥 Creating patient accounts...');
    const hashedPatientPassword = await bcrypt.hash('patient123', 10);
    const patientAccounts = await Account.insertMany([
      { email: 'patient1@healthcare.vn', password: hashedPatientPassword, roleId: patientRole._id, status: 'active' },
      { email: 'patient2@healthcare.vn', password: hashedPatientPassword, roleId: patientRole._id, status: 'active' },
      { email: 'patient3@healthcare.vn', password: hashedPatientPassword, roleId: patientRole._id, status: 'active' },
      { email: 'patient4@healthcare.vn', password: hashedPatientPassword, roleId: patientRole._id, status: 'active' }
    ]);

    // Create patient profiles
    const patients = await Patient.insertMany([
      {
        accountId: patientAccounts[0]._id,
        name: 'Trần Văn E',
        dob: new Date('1990-05-15'),
        phone: '0912345678',
        address: '456 Patient Street, District 1',
        gender: 'male'
      },
      {
        accountId: patientAccounts[1]._id,
        name: 'Lê Thị F',
        dob: new Date('1985-08-20'),
        phone: '0912345679',
        address: '789 Patient Avenue, District 2',
        gender: 'female'
      },
      {
        accountId: patientAccounts[2]._id,
        name: 'Phạm Văn G',
        dob: new Date('1995-12-10'),
        phone: '0912345680',
        address: '321 Patient Road, District 3',
        gender: 'male'
      },
      {
        accountId: patientAccounts[3]._id,
        name: 'Hoàng Thị H',
        dob: new Date('2000-03-25'),
        phone: '0912345681',
        address: '654 Patient Lane, District 4',
        gender: 'female'
      }
    ]);

    // Create schedules for doctors (next 7 days)
    console.log('📅 Creating doctor schedules...');
    const today = new Date();
    const schedules = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      for (const doctor of doctors) {
        const timeSlots = [];
        for (let hour = 8; hour < 17; hour++) {
          timeSlots.push({
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            isBooked: false
          });
        }

        schedules.push({
          doctor_id: doctor._id,
          date: date,
          timeSlots: timeSlots
        });
      }
    }

    await Schedule.insertMany(schedules);

    // Create health profiles for all patients
    console.log('🏥 Creating health profiles...');
    const healthProfiles = patients.map((patient, index) => ({
      ownerId: patient._id,
      ownerModel: 'Patient',
      bloodType: ['A', 'B', 'AB', 'O'][index % 4],
      allergies: index % 2 === 0 ? ['Penicillin'] : [],
      chronicConditions: index % 2 === 0 ? [`Bệnh lý ${index + 1}`] : [],
      medications: index % 2 === 1 ? ['Vitamin D'] : [],
      emergencyContact: {
        name: `Liên hệ khẩn cấp ${index + 1}`,
        phone: `09123456${80 + index}`,
        relationship: index % 2 === 0 ? 'Wife' : 'Husband'
      }
    }));

    const createdHealthProfiles = await HealthProfile.insertMany(healthProfiles);

    // Create appointments
    console.log('📋 Creating appointments...');
    const appointments = [
      {
        booker_id: patients[0]._id,
        healthProfile_id: createdHealthProfiles[0]._id,
        doctor_id: doctors[0]._id,
        specialty_id: createdSpecialties[0]._id,
        appointmentDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        timeSlot: '09:00',
        reason: 'Khám tổng quát định kỳ',
        status: 'confirmed'
      },
      {
        booker_id: patients[1]._id,
        healthProfile_id: createdHealthProfiles[1]._id,
        doctor_id: doctors[1]._id,
        specialty_id: createdSpecialties[1]._id,
        appointmentDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        timeSlot: '10:00',
        reason: 'Lấy cao răng',
        status: 'confirmed'
      },
      {
        booker_id: patients[2]._id,
        healthProfile_id: createdHealthProfiles[2]._id,
        doctor_id: doctors[2]._id,
        specialty_id: createdSpecialties[2]._id,
        appointmentDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        timeSlot: '14:00',
        reason: 'Trám răng số 6',
        status: 'pending'
      }
    ];

    const createdAppointments = await Appointment.insertMany(appointments);

    // Update schedule slots to booked
    for (const appointment of createdAppointments) {
      await Schedule.updateOne(
        { doctor_id: appointment.doctor_id, date: appointment.appointmentDate },
        { $set: { 'timeSlots.$[elem].isBooked': true } },
        { arrayFilters: [{ 'elem.startTime': appointment.timeSlot }] }
      );
    }

    // Create treatments
    console.log('🦷 Creating treatments...');
    const treatments = [
      {
        healthProfile: createdHealthProfiles[0]._id,
        doctor: doctors[0]._id,
        appointment: createdAppointments[0]._id,
        treatmentDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        diagnosis: 'Viêm nha chu nhẹ',
        totalCost: 500000,
        symptoms: 'Đau răng, chảy máu lợi',
        notes: 'Bệnh nhân đáp ứng tốt với điều trị'
      },
      {
        healthProfile: createdHealthProfiles[1]._id,
        doctor: doctors[1]._id,
        appointment: createdAppointments[1]._id,
        treatmentDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        diagnosis: 'Sâu răng',
        totalCost: 800000,
        symptoms: 'Đau khi ăn đồ ngọt',
        notes: 'Đang tiến hành trám răng'
      }
    ];

    const createdTreatments = await Treatment.insertMany(treatments);

    // Create prescriptions
    console.log('📄 Creating prescriptions...');
    const prescriptions = [
      {
        healthProfile_id: createdHealthProfiles[0]._id,
        totalPrice: 15000,
        items: [
          {
            medicineId: createdMedicines[0]._id,
            quantity: 10,
            dosage: '2 viên/lần, 3 lần/ngày',
            instructions: 'Uống sau ăn'
          },
          {
            medicineId: createdMedicines[2]._id,
            quantity: 15,
            dosage: '1 viên/lần, 2 lần/ngày',
            instructions: 'Uống khi đau'
          }
        ],
        notes: 'Theo dõi sau 1 tuần'
      }
    ];

    await Prescription.insertMany(prescriptions);

    console.log('🎉 Complete database seeded successfully!');
    console.log('\n📊 SUMMARY:');
    console.log('• 4 Roles created');
    console.log('• 1 Admin account');
    console.log('• 3 Doctor accounts');
    console.log('• 1 Receptionist account');
    console.log('• 4 Patient accounts');
    console.log('• 5 Specialties');
    console.log('• 7 Services');
    console.log('• 6 Medicines');
    console.log('• 21 Doctor schedules (7 days × 3 doctors)');
    console.log('• 3 Appointments');
    console.log('• 2 Health profiles');
    console.log('• 2 Treatments');
    console.log('• 1 Prescription');

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('Admin: admin@healthcare.vn / admin123');
    console.log('Doctor: doctor1@healthcare.vn / doctor123');
    console.log('Receptionist: receptionist@healthcare.vn / receptionist123');
    console.log('Patient: patient1@healthcare.vn / patient123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedDatabase();