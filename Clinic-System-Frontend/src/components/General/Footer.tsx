import {
    FaEnvelope,
    FaFacebook,
    FaInstagram,
    FaPhone,
    FaTwitter,
    FaYoutube
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-4 py-10">
                {/* Trusted by brands */}
                <div className="flex flex-wrap items-center gap-3 justify-center mb-10">
                    <span className="uppercase tracking-wider text-xs text-slate-400">
                        Được tin cậy bởi
                    </span>
                    {["MediX", "HealthOne", "BioCore", "CarePlus", "NovaLab"].map((b) => (
                        <span
                            key={b}
                            className="px-3 py-1 rounded-full border border-slate-700 text-sm"
                        >
                            {b}
                        </span>
                    ))}
                </div>

                {/* Main layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-white text-2xl font-bold">ProHealth</h3>
                        <p className="mt-3 text-sm">
                            Nhà cung cấp dịch vụ y tế hàng đầu với cơ sở vật chất hiện đại
                            và đội ngũ tận tâm.
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <a className="p-2 rounded-full bg-slate-800 hover:bg-[#13c2c2] hover:text-white">
                                <FaFacebook />
                            </a>
                            <a className="p-2 rounded-full bg-slate-800 hover:bg-[#13c2c2] hover:text-white">
                                <FaInstagram />
                            </a>
                            <a className="p-2 rounded-full bg-slate-800 hover:bg-[#13c2c2] hover:text-white">
                                <FaTwitter />
                            </a>
                            <a className="p-2 rounded-full bg-slate-800 hover:bg-[#13c2c2] hover:text-white">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    {/* Quick links + Departments (SIDE BY SIDE ON MOBILE) */}
                    <div className="grid grid-cols-2 gap-6 md:col-span-2">
                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase text-sm">
                                Liên Kết Nhanh
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#hero" className="hover:text-white">Trang Chủ</a></li>
                                <li><a href="#about" className="hover:text-white">Về Chúng Tôi</a></li>
                                <li><a href="#doctor" className="hover:text-white">Chuyên Khoa</a></li>
                                <li><a href="#doctors" className="hover:text-white">Bác Sĩ</a></li>
                                <li><a href="#appointment" className="hover:text-white">Liên Hệ</a></li>
                            </ul>
                        </div>

                        {/* Departments */}
                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase text-sm">
                                Chuyên Khoa
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li>Tim Mạch</li>
                                <li>Thần Kinh</li>
                                <li>Nhi Khoa</li>
                                <li>Phụ Khoa</li>
                                <li>Tâm Thần</li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 uppercase text-sm">
                            Liên Hệ
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <FaLocationDot className="mt-1 text-[var(--color-primary)]" />
                                <span>
                                    123 Nguyễn Trãi, Thanh Xuân, Hà Nội, Việt Nam
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaPhone className="text-[var(--color-primary)]" />
                                1900-0091
                            </li>
                            <li className="flex items-center gap-2">
                                <FaEnvelope className="text-[var(--color-primary)]" />
                                support@prohealth.vn
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-800">
                <div className="container mx-auto px-4 py-4 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>
                        © {new Date().getFullYear()} ProHealth. Mọi quyền được bảo lưu.
                    </span>
                    <span className="text-slate-400">Lương y như từ mẫu</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
