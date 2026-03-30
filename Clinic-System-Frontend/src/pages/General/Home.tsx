import BgPicture from '../../assets/bg-hero.png'
import contactBg from '../../assets/contact-picture.png'
import doctor1 from '../../assets/doctor_1.png'
import doctor2 from '../../assets/doctor_2.png'
import doctor3 from '../../assets/doctor_3.png'

import { FiPhone } from "react-icons/fi"
import { LuAmbulance, LuBaby } from "react-icons/lu"
import { IoEarOutline, IoLocationOutline } from 'react-icons/io5'
import { FaArrowRight, FaFacebook, FaInstagram, FaSyringe, FaTwitter } from 'react-icons/fa'
import { LiaDnaSolid } from 'react-icons/lia'
import { GiBrain, GiHeartOrgan } from 'react-icons/gi'
import { AiOutlineSchedule } from 'react-icons/ai'

import { Button, Card } from 'antd'
import Link from 'antd/es/typography/Link'

import Navbar from '../../components/General/Navbar'
import Footer from '../../components/General/Footer'

const HeroSection = () => (
  <section id="hero" className="relative min-h-[100svh] bg-gray-100">
    <img
      src={BgPicture}
      alt="Background"
      className="absolute inset-0 w-full h-full object-cover"
    />

    <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 text-white">
      <div className="text-center max-w-4xl space-y-6">
        <h2 className="italic font-semibold font-[Times_New_Roman]
          text-lg sm:text-xl md:text-2xl lg:text-4xl">
          Chào Mừng Đến Với Phòng Khám Của Chúng Tôi!
        </h2>
        <h1 className="font-bold
          text-3xl sm:text-4xl md:text-6xl lg:text-8xl">
          RẤT VUI KHI GẶP BẠN
        </h1>
        <a
          href="#department"
          onClick={e => {
            e.preventDefault()
            document.getElementById('department')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="inline-block rounded-xl bg-[var(--color-primary)] px-6 py-4
            font-bold text-white transition hover:bg-white hover:text-[var(--color-secondary)]"
        >
          Tìm Hiểu Thêm
        </a>
      </div>
    </div>
  </section>
)

const DepartmentSection = () => (
  <section id="department" className="bg-white py-20">
    <div className="container mx-auto px-4 max-w-7xl">
      <h1 className="text-center text-3xl md:text-4xl font-bold uppercase">Chuyên Khoa</h1>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[{
          icon: <LiaDnaSolid />,
          title: 'Da Liễu',
          href: '/doctors#Emergency'
        }, {
          icon: <LuBaby />,
          title: 'Nhi Khoa',
          href: '/doctors#Pediatric'
        }, {
          icon: <IoEarOutline />,
          title: 'Tai Mũi Họng',
          href: '/doctors#Gynecology'
        }, {
          icon: <GiHeartOrgan />,
          title: 'Tim Mạch',
          href: '/doctors#Cardiology'
        }, {
          icon: <FaSyringe />,
          title: 'Sản Phụ',
          href: '/doctors#Neurology'
        }, {
          icon: <GiBrain />,
          title: 'Nội Tổng Quát',
          href: '/doctors#Psychiatry'
        }].map((item, i) => (
          <Card
            key={i}
            className="group text-center shadow-md transition hover:-translate-y-2 hover:scale-105 hover:bg-[var(--color-primary)]"
          >
            <a href={item.href} className="flex flex-col items-center">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <div className="text-[64px] text-[var(--color-primary)]">{item.icon}</div>
              </div>
              <p className="font-bold uppercase text-[var(--color-primary)]">Khoa</p>
              <p className="font-bold uppercase text-[var(--color-primary)]">{item.title}</p>
            </a>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

const AboutSection = () => (
  <section id="about" className="bg-white py-20">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={contactBg}
            alt="About"
            className="h-[300px] md:h-[480px] object-contain"
          />
        </div>

        <div className="w-full md:w-1/2">
          <span className="uppercase border-b-2 border-[var(--color-primary)] text-gray-500">Về chúng tôi</span>
          <h2 className="mt-4 mb-6 text-3xl md:text-4xl font-bold">
            Về <span className="text-[var(--color-primary)]">Đội Ngũ Của Chúng Tôi</span>
          </h2>
          <p className="mb-3 flex items-center text-gray-400">
            <FaArrowRight className="mr-2" /> ProHealth là đội ngũ chuyên gia y tế giàu kinh nghiệm
          </p>
          <p className="text-gray-400">
            Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe toàn diện, tập trung vào con người chứ không chỉ triệu chứng.
          </p>

          <div className="mt-5 flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)]">
            <Link href="/about">Tìm hiểu thêm về chúng tôi</Link>
            <FaArrowRight className="text-xs" />
          </div>
        </div>
      </div>
    </div>
  </section>
)

const doctors = [
  { name: 'Bác Sĩ Nguyễn Văn A', image: doctor1, department: 'Tim Mạch', description: 'Chuyên gia tim mạch hàng đầu.' },
  { name: 'Bác Sĩ Lê Văn B', image: doctor2, department: 'Thần Kinh', description: 'Chuyên điều trị rối loạn thần kinh.' },
  { name: 'Bác Sĩ Trần Thị C', image: doctor3, department: 'Nhi Khoa', description: 'Bác sĩ nhi khoa tận tâm.' }
]

const DoctorSection = () => (
  <section id="doctors" className="bg-gray-100 py-20">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold uppercase mb-3">Chuyên Gia Hàng Đầu</h1>
        <p className="text-gray-400">Bác sĩ với chuyên môn hàng đầu miền Bắc</p>
        <Button
          className="mt-6"
          type="primary"
          size="large"
          icon={<AiOutlineSchedule />}
          onClick={() => window.location.href = '/patient/'}
        >
          Đặt lịch hẹn
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {doctors.map((d, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
              <img src={d.image} alt={d.name} className="object-contain h-full" />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-xl">{d.name}</h3>
              <p className="text-[var(--color-primary)] font-semibold">{d.department}</p>
              <p className="text-gray-500 text-sm mt-2">{d.description}</p>
              <div className="mt-4 flex justify-center gap-3">
                {[FaFacebook, FaInstagram, FaTwitter].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    aria-label="social"
                    className="flex h-9 w-9 items-center justify-center rounded-full
                      bg-[var(--color-primary)] text-white
                      hover:bg-slate-800 transition"
                  >
                    <Icon className="text-base" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const ContactSection = () => {
  return (
    <section id="appointment" className="bg-gray-100 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-center text-3xl md:text-4xl font-bold uppercase">
          Liên Hệ
        </h1>

        <div
          className="
            mt-10
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-8
            items-start
          "
        >
          {/* Hotline */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex-shrink-0
                h-14 w-14
                rounded-full
                bg-[var(--color-primary)]
                flex items-center justify-center
                text-white
              "
            >
              <FiPhone className="text-xl" />
            </div>

            <div className="leading-tight">
              <h2 className="text-sm font-bold uppercase">Đường dây nóng</h2>
              <p className="text-gray-400 text-base">1900-0091</p>
            </div>
          </div>

          {/* Ambulance */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex-shrink-0
                h-14 w-14
                rounded-full
                bg-[var(--color-primary)]
                flex items-center justify-center
                text-white
              "
            >
              <LuAmbulance className="text-xl" />
            </div>

            <div className="leading-tight">
              <h2 className="text-sm font-bold uppercase">Xe cấp cứu</h2>
              <p className="text-gray-400 text-base">876-256-876</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex-shrink-0
                h-14 w-14
                rounded-full
                bg-[var(--color-primary)]
                flex items-center justify-center
                text-white
              "
            >
              <IoLocationOutline className="text-xl" />
            </div>

            <div className="leading-tight">
              <h2 className="text-sm font-bold uppercase">Địa chỉ</h2>
              <p className="text-gray-400 text-base">Hà Nội, Việt Nam</p>
            </div>
          </div>

          {/* Button */}
          <div className="flex items-center justify-center">
            <Button
              type="primary"
              size="large"
              icon={<FaArrowRight />}
              onClick={() => (window.location.href = "/contact")}
            >
              Liên hệ
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};


const Home = () => (
  <>
    <Navbar />
    <HeroSection />
    <DepartmentSection />
    <AboutSection />
    <DoctorSection />
    <ContactSection />
    <Footer />
  </>
)

export default Home
