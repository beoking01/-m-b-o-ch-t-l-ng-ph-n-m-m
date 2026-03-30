import React, { useState } from 'react';
import { Calendar, Radio } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import 'dayjs/locale/vi';
import Title from 'antd/es/typography/Title';
dayjs.locale('vi');
import { getAvailableSlotsByDoctor } from '../../../services/ScheduleService';

interface ChooseDateAndTimeDoctorProps {
    doctorId: string;
    doctorName?: string;
    onNext: (date: string, timeSlot: string) => void;
    onBack: () => void;
}

const ChooseDateAndTimeDoctor: React.FC<ChooseDateAndTimeDoctorProps> = ({
    doctorId,
    doctorName,
    onNext,
    onBack
}) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [viewingMonth, setViewingMonth] = useState<Dayjs>(dayjs());
    const [mode, setMode] = useState<CalendarMode>('month');
    const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon'>('morning');
    const [availableTimes, setAvailableTimes] = useState<{ startTime: string, endTime: string }[]>([]);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ startTime: string, endTime: string } | null>(null);

    // Disable past dates
    const disabledDate = (current: Dayjs) => current && current.isBefore(dayjs().startOf('day'));

    // Load slots when selecting date or changing shift
    const loadSlots = async (date: Dayjs, shift: 'morning' | 'afternoon') => {
        setLoadingTimes(true);
        setAvailableTimes([]);
        setSelectedSlot(null);
        try {
            const dateStr = date.format('YYYY-MM-DD');
            const slots = await getAvailableSlotsByDoctor(doctorId, dateStr, shift);
            setAvailableTimes(slots);
        } catch (err) {
            console.error('Error loading slots:', err);
        } finally {
            setLoadingTimes(false);
        }
    };

    const handleSelectDate = (value: Dayjs) => {
        if (!disabledDate(value)) {
            setSelectedDate(value);
            setViewingMonth(value);
            loadSlots(value, selectedShift);
        }
    };

    const handleShiftChange = (shift: 'morning' | 'afternoon') => {
        setSelectedShift(shift);
        if (selectedDate) loadSlots(selectedDate, shift);
    };

    const handlePanelChange = (value: Dayjs, newMode: CalendarMode) => {
        setViewingMonth(value);
        setMode(newMode);
    };

    const fullCellRender = (value: Dayjs) => {
        const isSelected = selectedDate && value.isSame(selectedDate, 'day');
        const isCurrentMonth = value.month() === viewingMonth.month();
        const isPast = disabledDate(value);

        const utilityClasses = (!isCurrentMonth || isPast) ? 'text-gray-300 pointer-events-none' : 'text-black';
        const selectedClass = isSelected ? 'bg-blue-500 text-white' : '';

        return (
            <div className="flex items-center justify-center w-full h-full min-h-[36px]">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${utilityClasses} ${selectedClass}`}>
                    {value.date()}
                </div>
            </div>
        );
    };

    const renderSelectionText = () => {
        if (!selectedDate || !selectedSlot) {
            return <p className="text-gray-500 h-6 text-center">Vui lòng chọn ngày và ca khám</p>;
        }
        const formattedString = `${selectedDate.format('[Ngày] dddd, DD/MM/YYYY')}, ${doctorName ? doctorName + ', ' : ''}vào lúc ${selectedSlot.startTime} - ${selectedSlot.endTime}`;
        return <p className="text-lg font-semibold text-blue-600 h-6 text-center">{formattedString}</p>;
    };

    return (
        <div className="p-4 mx-auto">
            <Title level={3} className="mb-4">Chọn Ngày và Ca khám</Title>

            <Calendar
                className="custom-calendar-grid"
                mode={mode}
                value={selectedDate || viewingMonth}
                onSelect={handleSelectDate}
                onPanelChange={handlePanelChange}
                fullCellRender={fullCellRender}
                disabledDate={disabledDate}
            />

            <div className="mt-4">
                <h3 className="font-semibold text-base">Chọn buổi khám</h3>
                <div className="flex space-x-4 mt-2">
                    <Radio.Group value={selectedShift} onChange={(e) => handleShiftChange(e.target.value)} name="shift">
                        <Radio value="morning">Buổi sáng</Radio>
                        <Radio value="afternoon">Buổi chiều</Radio>
                    </Radio.Group>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold text-base">Chọn thời gian ca khám</h3>
                    {loadingTimes && <p className="text-gray-500 my-2">Đang tải ca khám...</p>}
                    {!loadingTimes && availableTimes.length === 0 && selectedDate && (
                        <p className="text-red-500 my-2">Không có ca khám trống trong ngày này</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {availableTimes.map((slot) => {
                            const label = `${slot.startTime} - ${slot.endTime}`;
                            return (
                                <button
                                    key={label}
                                    className={`${selectedSlot?.startTime === slot.startTime ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black border-gray-300 hover:bg-gray-50'} px-3 py-1.5 border rounded-md`}
                                    onClick={() => setSelectedSlot(slot)}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">{renderSelectionText()}</div>

            <div className="mt-6 flex justify-between">
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium" onClick={onBack}>Quay lại</button>
                <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
                    onClick={() => {
                        if (selectedDate && selectedSlot) {
                            const dateStr = selectedDate.format('YYYY-MM-DD');
                            const slotLabel = `${selectedSlot.startTime}-${selectedSlot.endTime}`;
                            onNext(dateStr, slotLabel);
                        }
                    }}
                    disabled={!selectedDate || !selectedSlot}
                >
                    Tiếp theo
                </button>
            </div>
        </div>
    );
};

export default ChooseDateAndTimeDoctor;