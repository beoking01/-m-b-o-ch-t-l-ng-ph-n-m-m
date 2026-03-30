type Doctor = {
    photo?: string;
    avatar?: string;
    accountId?: any;
    name: string;
    specialty: string;
    tagline?: string;
    phone?: string;
    yearsExperience?: number;
    rating?: number;
};

type DoctorHeroProps = {
    doctor: Doctor;
    onBook: () => void;
};


function DoctorHero({ doctor, onBook }: DoctorHeroProps) {
    return (
        <header className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
                <img
                    src={doctor.photo || doctor.avatar || doctor.accountId?.avatar || '/default-avatar.png'}
                    alt={`${doctor.name} photo`}
                    className="w-32 h-32 rounded-full object-cover border-2 border-sky-200"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold">{doctor.name}</h1>
                    <p className="text-sky-600 font-medium">{doctor.specialty}</p>
                    <p className="mt-2 text-sm text-gray-600">{doctor.tagline}</p>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={onBook}
                            className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
                        >
                            Đặt lịch
                        </button>
                        <a href={`tel:${doctor.phone}`} className="px-4 py-2 rounded border">Gọi</a>
                    </div>
                </div>
                <div className="w-full md:w-56 text-right md:text-right">
                    <div className="text-sm text-gray-500">Kinh nghiệm</div>
                    <div className="text-xl font-medium">{doctor.yearsExperience} năm</div>
                    <div className="mt-2 text-sm text-gray-500">Đánh giá</div>
                    <div className="text-lg font-semibold">{doctor.rating} ★</div>
                </div>
            </div>
        </header>
    )
}

export default DoctorHero;