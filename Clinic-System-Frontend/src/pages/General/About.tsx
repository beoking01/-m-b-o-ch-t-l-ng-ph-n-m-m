import picAbout1 from '../../assets/pic-about-1.png'
import picAbout2 from '../../assets/pic-about-2.png';
import { Card, Carousel } from 'antd';
import { FaArrowRight, } from 'react-icons/fa';
import Link from 'antd/es/typography/Link';
import Footer from '../../components/General/Footer';
import NavbarDark from '../../components/General/NavbarDark';


const AboutContent = () => {
    return (
        <section id='about-content' className='bg-white pt-10'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row items-center'>
                    <div className='w-full md:w-1/2 p-5 md:p-10'>
                        <div className='image object-center text-center flex items-center 
                            justify-center'>
                            <img src={picAbout1} alt="ContactBg" className='h-[400px] md:h-[480px] 
                                object-cover rounded-lg' />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 p-5">
                        <div className="text">
                            <span className="text-gray-500 border-b-2 border-[var(--color-primary)] 
                            uppercase">Về chúng tôi
                            </span>
                            <h2 className="my-4 font-bold text-3xl sm:text-4xl ">
                                Về <span className="text-[var(--color-primary)]">
                                    Phòng Khám ProHealth
                                </span>
                            </h2>
                            <p className="text-gray-700 text-lg mb-4">
                                Phòng Khám ProHealth là một nhà cung cấp dịch vụ chăm sóc sức khỏe hàng đầu tại Hà Nội, Việt Nam,
                                tận tâm mang đến các dịch vụ y tế toàn diện bằng
                                sự tận tâm và chuyên môn cao.
                            </p>
                            <p className="text-gray-600 text-base mb-4">
                                Được thành lập vào năm 2010, phòng khám của chúng tôi đã phát triển thành một cái tên đáng tin cậy
                                trong cộng đồng, cung cấp cơ sở vật chất hiện đại và đội ngũ
                                chuyên gia có tay nghề cao. Chúng tôi chuyên sâu trong nhiều chuyên khoa
                                bao gồm Cấp Cứu, Nhi Khoa, Sản Phụ khoa, Tim Mạch, Thần Kinh,
                                và Tâm Thần.
                            </p>
                            <p className="text-gray-600 text-base mb-4">
                                Sứ mệnh của chúng tôi là cung cấp dịch vụ chăm sóc sức khỏe toàn diện, giải quyết
                                sự khỏe mạnh về thể chất, cảm xúc và tinh thần của bệnh nhân.
                                Chúng tôi tin vào chăm sóc phòng ngừa, giáo dục bệnh nhân và kế hoạch
                                điều trị cá nhân hóa để đảm bảo kết quả tốt nhất.
                            </p>
                            <div className='flex items-center gap-2 mt-5'>
                                <Link className='!text-base !text-[var(--color-primary)] 
                                hover:!text-[var(--color-secondary)]' href='/contact'>
                                    Liên hệ với chúng tôi để biết thêm thông tin
                                </Link>
                                <FaArrowRight className='text-xs text-[var(--color-primary)]' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const GlobalReach = () => {
    return (
        <section id='global-reach' className='bg-white py-20'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row items-center'>
                    <div className='w-full md:w-1/2 p-5 md:p-10 order-2 md:order-1'>
                        <div className="text">
                            <span className="text-gray-500 border-b-2 border-[var(--color-primary)]
                             uppercase">
                                Phạm vi Toàn cầu
                            </span>
                            <h2 className="my-4 font-bold text-3xl sm:text-4xl ">
                                Sự Hiện Diện <span className="text-[var(--color-primary)]">
                                    Quốc Tế Của Chúng Tôi
                                </span>
                            </h2>
                            <p className="text-gray-700 text-lg mb-4">
                                Phòng Khám ProHealth mở rộng chuyên môn vượt ra ngoài biên giới,
                                hợp tác với các tổ chức chăm sóc sức khỏe quốc tế để mang lại
                                các phương pháp y tế đẳng cấp thế giới đến Việt Nam.
                            </p>
                            <p className="text-gray-600 text-base mb-4">
                                Chúng tôi hợp tác với các bệnh viện hàng đầu ở Mỹ, Châu Âu và Châu Á
                                để trao đổi kiến thức, áp dụng công nghệ tiên tiến và tham gia
                                vào các sáng kiến sức khỏe toàn cầu. Các bác sĩ của chúng tôi thường xuyên tham dự
                                các hội nghị và chương trình đào tạo quốc tế để luôn đi đầu
                                trong những tiến bộ y học.
                            </p>
                            <p className="text-gray-600 text-base mb-4">
                                Thông qua dịch vụ y học từ xa, chúng tôi kết nối bệnh nhân với các chuyên gia
                                trên toàn thế giới, đảm bảo tiếp cận chuyên môn đa dạng. ProHealth
                                cam kết tuân thủ các tiêu chuẩn chăm sóc toàn cầu, giữ các chứng nhận từ
                                các tổ chức quốc tế như JCI.
                            </p>
                            <div className='flex items-center gap-2 mt-5'>
                                <Link className='!text-base !text-[var(--color-primary)] 
                                hover:!text-[var(--color-secondary)]'>
                                    Tìm hiểu thêm về quan hệ đối tác toàn cầu của chúng tôi</Link>
                                <FaArrowRight className='text-xs text-[var(--color-primary)]' />
                            </div>
                        </div>
                    </div>
                    <div className='w-full md:w-1/2 p-5 md:p-10 order-1 md:order-2'>
                        <div className='image object-center text-center flex items-center 
                            justify-center'>
                            <img src={picAbout2} alt="Global Reach" className='h-[400px] md:h-[480px] 
                                object-cover rounded-lg' />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const MissionVision = () => {
    return (
        <section id='mission-vision' className="bg-gray-100 py-20">
            <div className='container mx-auto px-4'>
                <div className='flex flex-col items-center justify-center mb-10'>
                    <h1 className='text-4xl font-bold uppercase'>Sứ Mệnh & Tầm Nhìn Của Chúng Tôi</h1>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <Card className="shadow-md p-6">
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                            Sứ Mệnh
                        </h3>
                        <p className="text-gray-600">
                            Cung cấp các dịch vụ chăm sóc sức khỏe dễ tiếp cận, chất lượng cao, giúp
                            các cá nhân và cộng đồng sống khỏe mạnh hơn thông qua đổi mới,
                            lòng nhân ái và sự xuất sắc.
                        </p>
                    </Card>
                    <Card className="shadow-md p-6">
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                            Tầm Nhìn
                        </h3>
                        <p className="text-gray-600">
                            Trở thành điểm đến chăm sóc sức khỏe hàng đầu tại Việt Nam, thiết lập các tiêu chuẩn mới
                            trong chăm sóc bệnh nhân, nghiên cứu y học và các sáng kiến sức khỏe
                            cộng đồng.
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    );
};

const patients = [
    {
        name: 'Anna Lee',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        feedback: 'Sự chăm sóc tại ProHealth là đặc biệt. Đội ngũ nhân viên rất nhân ái và chuyên nghiệp trong suốt quá trình điều trị của tôi.'
    },
    {
        name: 'Michael Chen',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        feedback: 'Nhờ đội ngũ tại ProHealth, tôi đã hồi phục nhanh chóng sau cơn bệnh. Rất khuyến nghị!'
    },
    {
        name: 'Sophia Nguyen',
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
        feedback: 'Dịch vụ nhi khoa tốt nhất cho con tôi. Các bác sĩ rất am hiểu và rất kiên nhẫn.'
    },
    {
        name: 'David Kim',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        feedback: 'Dịch vụ chuyên nghiệp và cơ sở vật chất hiện đại. Rất biết ơn chuyên môn của họ trong lĩnh vực tim mạch.'
    },
    {
        name: 'Emma Tran',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        feedback: 'Khoa thần kinh xuất sắc. Họ đã giúp tôi quản lý tình trạng bệnh một cách hiệu quả.'
    },
    {
        name: 'James Wong',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        feedback: 'Chăm sóc tận tâm và kế hoạch điều trị cá nhân hóa. ProHealth là tốt nhất ở Hà Nội.'
    }
];

const chunk = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const PatientFeedback = () => {
    return (
        <section id='patient-feedback' className='bg-gray-100 py-20'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col items-center justify-center mb-6'>
                    <h1 className='text-4xl font-bold uppercase'>Phản Hồi Từ Bệnh Nhân</h1>
                    <p className='text-base text-gray-400 mt-3'>Những gì bệnh nhân của chúng tôi nói về chúng tôi</p>
                </div>
                <Carousel autoplay arrows infinite={true}>
                    {chunk(patients, 2).map((pair, index) => (
                        <div key={index}>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 p-5'>
                                {pair.map((patient: {
                                    name: string;
                                    image: string;
                                    feedback: string;
                                }, idx: number) => (
                                    <div key={idx} className='bg-blue-50 rounded-3xl p-4 flex 
                                    items-center gap-4 shadow-md'>
                                        <img src={patient.image} alt={patient.name}
                                            className='w-16 h-16 rounded-full object-cover' />
                                        <div>
                                            <h3 className='font-bold text-lg text-gray-800'>
                                                {patient.name}
                                            </h3>
                                            <p className='text-gray-600'>{patient.feedback}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

const About = () => {
    return (
        <div>
            <NavbarDark />
            <AboutContent />
            <GlobalReach />
            <MissionVision />
            <PatientFeedback />
            <Footer />
        </div>
    );
};

export default About;