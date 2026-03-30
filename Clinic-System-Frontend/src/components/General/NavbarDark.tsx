import { useEffect, useState } from 'react';
import logo from '../../assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, message } from 'antd';
import { FaUserLarge } from 'react-icons/fa6';

const NavbarDark = () => {
    const [isTop, setIsTop] = useState(true);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const getDashboardLink = () => {
        if (!user) return '/patient/appointments-specialty';
        
        switch (user.role) {
            case 'doctor':
                return '/doctor';
            case 'admin':
                return '/admin';
            case 'receptionist':
                return '/receptionist';
            case 'patient':
            default:
                return '/patient/appointments-specialty';
        }
    };

    const getDashboardText = () => {
        if (!user) return 'ĐẶT LỊCH';
        
        switch (user.role) {
            case 'doctor':
                return 'TRANG BÁC SĨ';
            case 'admin':
                return 'QUẢN TRỊ';
            case 'receptionist':
                return 'LỄ TÂN';
            case 'patient':
            default:
                return 'ĐẶT LỊCH';
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsTop(window.scrollY === 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            message.success('Đăng xuất thành công!', 2);
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 w-full z-20 transition-colors duration-300 ${isTop ? 'bg-slate-800 shadow-none' : 'bg-white shadow'
                    }`}
            >
                <div className="container mx-auto flex justify-between items-center p-4">
                    <a className="w-50 cursor-pointer " href="/">
                        <img src={logo} alt="Logo"
                            className={`${isTop ? 'filter brightness-0 invert' : ''}`}
                        />
                    </a>

                    <nav
                        className={`flex gap-4 items-center transition-colors duration-300 
                            ${isTop ? 'text-white' : 'text-black'
                            }`}
                    >
                        <>
                            <Link to={getDashboardLink()} className='text-base font-semibold'>{getDashboardText()}</Link>
                            <Link to="/doctors" className='text-base font-semibold'>BÁC SĨ</Link>
                            <Link to="/about" className='text-base font-semibold'>GIỚI THIỆU</Link>
                            <Link to="/contact" className='text-base font-semibold'>LIÊN HỆ</Link>
                        </>

                        <div className='flex items-center gap-3'>
                            {user ? (
                                <>
                                    <FaUserLarge /> {user.email || 'User'}
                                    <Button
                                        onClick={handleLogout}
                                        variant="solid" color="blue"
                                        className='!text-base !font-bold'
                                    >
                                        Đăng xuất
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => navigate('/login')}
                                        variant="solid" color="blue"
                                        className='!text-base !font-bold'>
                                        Đăng nhập
                                    </Button>
                                    <Button
                                        color="blue" variant="outlined" ghost
                                        className='!text-base !font-bold'
                                        onClick={() => navigate('/register')}
                                    >
                                        Đăng ký
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

        </>
    );
}

export default NavbarDark;