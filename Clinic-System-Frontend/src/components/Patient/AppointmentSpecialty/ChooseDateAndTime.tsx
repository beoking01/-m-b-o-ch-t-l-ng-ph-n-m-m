import React, { useState } from 'react';
import { Calendar, Radio } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import 'dayjs/locale/vi';
import Title from 'antd/es/typography/Title';
dayjs.locale('vi');
import { getAvailableBySpecialty } from '../../../services/ScheduleService';

interface ChooseDateAndTimeProps {
    specialtyId: string;
    onNext: (date: string, timeSlot: string) => void;
    onBack: () => void;
}

const ChooseDateAndTime: React.FC<ChooseDateAndTimeProps> = ({ specialtyId, onNext, onBack }) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [viewingMonth, setViewingMonth] = useState<Dayjs>(dayjs());
    const [mode, setMode] = useState<CalendarMode>('month');
    const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon'>('morning');
    const [availableTimes, setAvailableTimes] = useState<{ startTime: string, endTime: string, doctor_ids: string[] }[]>([]);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{
        startTime: string,
        endTime: string,
        doctor_ids: string[]
    } | null>(null);

    // Hàm vô hiệu hóa ngày trong quá khứ
    const disabledDate = (current: Dayjs) => {
        return current && current.isBefore(dayjs().startOf('day'));
    };

    // Xử lý khi chọn ngày
    const handleSelectDate = async (value: Dayjs) => {
        if (!disabledDate(value)) {
            setSelectedDate(value);
            setViewingMonth(value);
            setAvailableTimes([]);

            setLoadingTimes(true);
            try {
                const dateStr = value.format("YYYY-MM-DD");
                const res = await getAvailableBySpecialty(specialtyId, dateStr, selectedShift);

                setAvailableTimes(res);
            } catch (err) {
                console.error("load schedule error:", err);
            } finally {
                setLoadingTimes(false);
            }
        }
    };

    // Xử lý khi thay đổi tháng/năm xem
    const handlePanelChange = (value: Dayjs, newMode: CalendarMode) => {
        setViewingMonth(value);
        setMode(newMode);
    };

    // Tùy chỉnh render ô ngày để căn giữa và áp dụng style
    const fullCellRender = (value: Dayjs) => {
        const isSelected = selectedDate && value.isSame(selectedDate, 'day');
        const isCurrentMonth = value.month() === viewingMonth.month();
        const isPast = disabledDate(value); // Kiểm tra ngày quá khứ

        // Class cho các ngày mờ (ngoài tháng hoặc đã qua)
        const utilityClasses = (!isCurrentMonth || isPast)
            ? 'text-gray-300 pointer-events-none'
            : 'text-black';

        // Class cho ngày được chọn
        const selectedClass = isSelected
            ? 'bg-blue-500 text-white'
            : '';

        // Render ô ngày với các class đã xác định
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[36px]">
                <div
                    className={`
                        flex items-center justify-center w-8 h-8 rounded-full
                        ${utilityClasses} 
                        ${selectedClass}
                    `}
                >
                    {value.date()}
                </div>
            </div>
        );
    };

    // Xử lý khi thay đổi ca khám
    const handleShiftChange = async (shift: 'morning' | 'afternoon') => {
        setSelectedShift(shift);
        setSelectedSlot(null);

        if (selectedDate) {
            setLoadingTimes(true);
            try {
                const dateStr = selectedDate.format("YYYY-MM-DD");
                const res = await getAvailableBySpecialty(specialtyId, dateStr, shift);
                setAvailableTimes(res);
            } catch (err) {
                console.error("load schedule error:", err);
            } finally {
                setLoadingTimes(false);
            }
        }
    };

    // hiển thị lựa chọn ngày và ca khám
    const renderSelectionText = () => {
        if (!selectedDate || !selectedSlot) {
            return <p className="text-gray-500 h-6 text-center">Vui lòng chọn ngày và ca khám</p>
        }

        const formattedString = `${selectedDate.format('[Ngày] dddd, DD/MM/YYYY')}, vào lúc ${selectedSlot.startTime} - ${selectedSlot.endTime}`

        return <p className="text-lg font-semibold text-blue-600 h-6 text-center">{formattedString}</p>
    }


    return (
        <div className="p-4 mx-auto">
            <Title level={3} className="mb-4">2. Chọn Ngày và Ca khám</Title>
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
                    <label className="inline-flex items-center cursor-pointer">
                        <Radio.Group
                            value={selectedShift}
                            onChange={(e) => handleShiftChange(e.target.value)}
                            name="shift"
                        >
                            <Radio value="morning">Buổi sáng</Radio>
                            <Radio value="afternoon">Buổi chiều</Radio>
                        </Radio.Group>
                    </label>
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

            <div className="mt-6 text-center">
                {renderSelectionText()}
            </div>

            <div className="mt-6 flex justify-between">
                <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
                    onClick={onBack}
                >
                    Quay lại
                </button>
                <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium
                               disabled:bg-blue-300 disabled:cursor-not-allowed"
                    onClick={() => {
                        if (selectedDate && selectedSlot) {
                            const dateStr = selectedDate.format('YYYY-MM-DD');
                            const label = `${selectedSlot.startTime}-${selectedSlot.endTime}`;
                            // gửi slot label hoặc gửi cả doctor_ids lên component cha
                            onNext(dateStr, label);
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

export default ChooseDateAndTime;