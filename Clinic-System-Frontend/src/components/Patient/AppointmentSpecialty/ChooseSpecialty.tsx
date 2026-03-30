import { Card, Col, Row, message, Skeleton, Typography, Input, Pagination } from "antd";
import { useEffect, useState } from "react";
import { FaUserMd, FaSearch } from "react-icons/fa";
import { getSpecialties, type Specialty, type SpecialtyMeta } from "../../../services/SpecialtyService";
import { CacheService } from "../../../services/CacheService";

const { Title, Paragraph } = Typography;

type ChooseSpecialtyProps = {
    // Callback để component cha biết chuyên khoa nào đã được chọn
    onNext: (specialtyId: string) => void;
    selectedSpecialtyId: string | null;
    disabled?: boolean;
};

const ChooseSpecialty: React.FC<ChooseSpecialtyProps> = ({ onNext, selectedSpecialtyId, disabled }) => {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [meta, setMeta] = useState<SpecialtyMeta | null>(null);
    const [loading, setLoading] = useState(false);

    // Pagination & Search state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6); // 6 cards per page (2 rows of 3)
    const [searchInput, setSearchInput] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        fetchSpecialties();
    }, [page, pageSize, q]);

    const fetchSpecialties = async () => {
        try {
            setLoading(true);
            
            const cacheKey = `specialties_page_${page}_size_${pageSize}_q_${q || 'all'}`;
            
            // Check cache first
            let cachedData = CacheService.get<{ items: Specialty[]; meta: SpecialtyMeta }>(cacheKey);
            if (cachedData) {
                setSpecialties(cachedData.items);
                setMeta(cachedData.meta);
            } else {
                const data = await getSpecialties({ page, limit: pageSize, q });
                setSpecialties(data.items);
                setMeta(data.meta);
                CacheService.set(cacheKey, { items: data.items, meta: data.meta });
            }
        } catch (error) {
            message.error("Lỗi khi lấy danh sách chuyên khoa.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1); // Reset to first page when searching
        setQ(searchInput.trim());
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    const handleSelectSpecialty = (specialtyId: string) => {
        if (!disabled) {
            onNext(specialtyId);
        }
    };    return (
        <div className="p-4">
            <Title level={3} className="mb-4">1. Chọn Chuyên Khoa</Title>

            {/* Search Bar */}
            <div className="mb-4">
                <Input.Search
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm kiếm chuyên khoa..."
                    allowClear
                    size="large"
                    enterButton={
                        <span className="flex items-center gap-2">
                            <FaSearch /> Tìm kiếm
                        </span>
                    }
                    onSearch={handleSearch}
                    style={{ maxWidth: 500 }}
                />
            </div>

            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {specialties.length > 0 ? (
                            specialties.map((specialty) => (
                                <Col xs={24} sm={12} md={8} key={specialty._id}>
                                    <Card
                                        title={
                                            <div className="flex items-center gap-2">
                                                <FaUserMd className="text-lg text-blue-500" />
                                                {specialty.name}
                                            </div>
                                        }
                                        hoverable
                                        className={`
                                            transition-all duration-200 
                                            ${selectedSpecialtyId === specialty._id
                                                ? 'border-4 border-blue-500 shadow-lg'
                                                : 'border-gray-200'
                                            }
                                        `}
                                        onClick={() => handleSelectSpecialty(specialty._id)}
                                    >
                                        <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                                            {specialty.description}
                                        </Paragraph>
                                        <Paragraph className="mt-2 font-semibold text-blue-500">
                                            {selectedSpecialtyId === specialty._id ?
                                                <p className="!text-blue-500">Đã chọn</p>
                                                : 'Chọn khám'}
                                        </Paragraph>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <Paragraph className="text-center text-gray-500">
                                    Không tìm thấy chuyên khoa nào.
                                </Paragraph>
                            </Col>
                        )}
                    </Row>

                    {/* Pagination */}
                    {meta && meta.total > 0 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                current={page}
                                pageSize={pageSize}
                                total={meta.total}
                                onChange={handlePageChange}
                                showSizeChanger
                                pageSizeOptions={[6, 9, 12, 18]}
                                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} chuyên khoa`}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ChooseSpecialty;