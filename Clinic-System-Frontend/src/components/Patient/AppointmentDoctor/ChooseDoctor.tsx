import React, { useEffect, useState } from 'react';
import { List, Avatar, Button, Select, message, Skeleton, Pagination, Input } from 'antd';
import { getDoctorsWithPaging, type Doctor } from '../../../services/DoctorService';
import { getSpecialties, type Specialty } from '../../../services/SpecialtyService';
import { CacheService } from '../../../services/CacheService';
import { FaSearch, FaUserMd } from 'react-icons/fa';

interface ChooseDoctorProps {
  onNext: (doctorId: string) => void;
  selectedDoctorId: string | null;
  disabled?: boolean;
}

const ChooseDoctor: React.FC<ChooseDoctorProps> = ({ onNext, selectedDoctorId, disabled }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filterSpecialty, setFilterSpecialty] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<string | null>(selectedDoctorId || null);
  const [loading, setLoading] = useState(false);

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  // Load specialties once
  useEffect(() => {
    (async () => {
      try {
        const cacheKey = 'specialties_list';
        
        // Check cache first
        let cachedData = CacheService.get<{ items: Specialty[] }>(cacheKey);
        if (cachedData) {
          setSpecialties(cachedData.items);
        } else {
          const sp = await getSpecialties();
          setSpecialties(sp.items);
          CacheService.set(cacheKey, sp);
        }
      } catch (err) {
        message.error('Lỗi tải danh sách chuyên khoa');
      }
    })();
  }, []);

  // Fetch doctors with pagination
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        const cacheKey = `doctors_page_${page}_size_${pageSize}_q_${q}_specialty_${filterSpecialty || 'all'}`;
        
        // Check cache first
        let cachedData = CacheService.get<{ items: Doctor[]; total: number }>(cacheKey);
        if (cachedData) {
          setDoctors(cachedData.items);
          setTotal(cachedData.total);
        } else {
          const result = await getDoctorsWithPaging({ 
            page, 
            limit: pageSize, 
            q: q || undefined,
            specialtyId: filterSpecialty 
          });
          setDoctors(result.items);
          setTotal(result.total);
          CacheService.set(cacheKey, { items: result.items, total: result.total });
        }
      } catch (err) {
        message.error('Lỗi tải danh sách bác sĩ');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, filterSpecialty, q]);

  const handleSearch = () => {
    setPage(1);
    setQ(searchInput.trim());
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleSpecialtyChange = (val: string | undefined) => {
    setFilterSpecialty(val);
    setPage(1); // Reset to first page when filter changes
  };
  // Default avatar component with lazy loading
  const DoctorAvatar: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
    const avatarUrl = (doctor as any).avatar || (doctor as any).accountId?.avatar;
    
    // Check if avatar is valid (not empty string, null, or undefined)
    const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '';
    
    return (
      <Avatar 
        src={hasValidAvatar ? avatarUrl : undefined}
        icon={!hasValidAvatar ? <FaUserMd /> : undefined}
        style={{ 
          backgroundColor: !hasValidAvatar ? '#1677ff' : undefined,
        }}
      />
    );
  };
  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">1. Chọn bác sĩ</h3>

      {/* Filter and Search Row */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <Select
          placeholder="Lọc theo chuyên khoa (tuỳ chọn)"
          allowClear
          style={{ width: '100%', maxWidth: 300 }}
          onChange={handleSpecialtyChange}
          value={filterSpecialty}
        >
          {specialties.map(s => (
            <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>
          ))}
        </Select>

        <Input.Search
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm kiếm bác sĩ..."
          allowClear
          style={{ width: '100%', maxWidth: 400 }}
          enterButton={
            <span className="flex items-center gap-2">
              <FaSearch /> Tìm
            </span>
          }
          onSearch={handleSearch}
        />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={safeDoctors}
            locale={{ emptyText: 'Không tìm thấy bác sĩ nào' }}
            renderItem={item => (
              <List.Item
                style={{
                  border: selected === item._id ? '2px solid #1677ff' : '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 12,
                  transition: 'all 0.2s',
                }}
                actions={[
                  <Button
                    key={`btn-${item._id}`}
                    type={selected === item._id ? 'primary' : 'default'}
                    disabled={disabled}
                    onClick={() => !disabled && setSelected(item._id)}
                  >
                    {selected === item._id ? 'Đã chọn' : 'Chọn'}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<DoctorAvatar doctor={item} />}
                  title={<span className="font-semibold">{item.name}</span>}
                  description={
                    <>
                      <div className="text-gray-500 text-sm">
                        {item.specialtyId?.name || 'Không rõ chuyên khoa'}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />

          {/* Pagination */}
          {total > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={[5, 10, 15, 20]}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} bác sĩ`}
              />
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          disabled={disabled}
          onClick={() => {
            if (!selected) return message.warning('Vui lòng chọn bác sĩ');
            onNext(selected);
          }}
        >
          Tiếp theo
        </Button>
      </div>
    </div>
  );
};

export default ChooseDoctor;
