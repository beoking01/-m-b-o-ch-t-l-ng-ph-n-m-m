import React from 'react';
import type { Doctor as DoctorType } from '../../services/DoctorService';

type Props = {
    doctor: DoctorType;
    onClick?: (doctor: DoctorType) => void;
    selected?: boolean;
    className?: string;
    height?: string | number;
};

const DoctorCard: React.FC<Props> = ({ doctor, onClick, selected, className, height }) => {
    const specialtyName = typeof doctor.specialtyId === 'object' && doctor.specialtyId ? (doctor.specialtyId as any).name : undefined;
    const imgSrc = (doctor as any).photo ?? (doctor as any).image ?? (doctor as any).avatar ?? (doctor as any).accountId?.avatar ?? '/placeholder-doctor.png';
    const description = (doctor as any).description ?? (doctor as any).bio ?? undefined;

    return (
        <div
            onClick={() => onClick?.(doctor)}
            role={onClick ? 'button' : undefined}
            className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform duration-300 cursor-pointer mx-auto w-full max-w-[360px] ${selected ? 'ring-4 ring-blue-500' : ''} ${className ?? ''}`}
            style={{ height: height ?? 420 }}
        >
            <div className="h-1/2 w-full flex items-center justify-center bg-blue-50">
                <img
                    src={imgSrc}
                    alt={doctor.name}
                    className="object-cover h-40 w-40 rounded-full border-4 border-white shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-doctor.png'; }}
                />
            </div>

            <div className="h-1/2 p-4 flex flex-col justify-start text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-800 leading-tight">{doctor.name}</h3>
                {specialtyName && <p className="text-[var(--color-primary)] font-semibold mb-2 text-sm">{specialtyName}</p>}
                {description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                        {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                    </p>
                )}

                <div className="flex items-center justify-center text-white gap-3 mt-auto">
                    <a aria-label="Facebook" className="p-2 rounded-full bg-[var(--color-primary)] hover:bg-slate-800 transition-colors" />
                    <a aria-label="Instagram" className="p-2 rounded-full bg-[var(--color-primary)] hover:bg-slate-800 transition-colors" />
                    <a aria-label="Twitter" className="p-2 rounded-full bg-[var(--color-primary)] hover:bg-slate-800 transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;