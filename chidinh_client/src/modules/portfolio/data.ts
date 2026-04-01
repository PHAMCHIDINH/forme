export type PortfolioDockItem = {
  label: string;
  to: string;
  end?: boolean;
};

export type DesktopWindowCopy = {
  title: string;
  subtitle: string;
};

export type ArchiveCard = {
  title: string;
  summary: string;
};

export type RegistryCard = {
  name: string;
  status: string;
  summary: string;
};

export type PortfolioData = {
  displayName: string;
  title: string;
  intro: string;
  githubUrl: string;
  contactEmail: string;
  desktopIndicators: string[];
  dockItems: PortfolioDockItem[];
  windows: {
    identity: DesktopWindowCopy;
    archive: DesktopWindowCopy;
    operatingModel: DesktopWindowCopy;
    registry: DesktopWindowCopy;
    notes: DesktopWindowCopy;
  };
  principles: string[];
  archiveCards: ArchiveCard[];
  registryCards: RegistryCard[];
  architectureSignals: string[];
};

export const portfolioData: PortfolioData = {
  displayName: "Pham Chi Dinh",
  title: "Full-stack Developer & System Architect",
  intro:
    "Sinh viên năm cuối ngành Công nghệ Thông tin định hướng Full-stack Web Developer & System Architect. Sở hữu tư duy xây dựng kiến trúc hệ thống rõ ràng và thiết kế Neo-brutalism sắc bén.",
  githubUrl: "https://github.com/PHAMCHIDINH",
  contactEmail: "chidinhp4@gmail.com",
  desktopIndicators: ["Public Desktop", "Live Modules", "Warm macOS"],
  dockItems: [
    { label: "Portfolio", to: "/", end: true },
    { label: "Systems", to: "/#archive" },
    { label: "Workspace", to: "/login" },
    { label: "Contact", to: "/#contact" },
  ],
  windows: {
    identity: {
      title: "About / Identity",
      subtitle: "Curated desktop scene",
    },
    archive: {
      title: "System Archive",
      subtitle: "Sản phẩm & Dự án tiêu biểu",
    },
    operatingModel: {
      title: "Operating Model",
      subtitle: "Principles behind the machine",
    },
    registry: {
      title: "Module Registry",
      subtitle: "Live and near-future modules",
    },
    notes: {
      title: "Architecture Notes",
      subtitle: "Signals from the technical stack",
    },
  },
  principles: [
    "Modular boundaries over sprawling complexity. (Ưu tiên giới hạn module độc lập hơn sự cồng kềnh).",
    "Giao diện cần phải dễ chịu và trực quan ngay cả khi hệ thống vô cùng phức tạp.",
    "Khéo léo thể hiện kiến trúc sản phẩm thay vì giấu chúng sau các template rập khuôn.",
    "Bảo vệ mã nguồn sạch (clean code) và hệ thống dễ dàng mở rộng.",
  ],
  archiveCards: [
    {
      title: "Chợ Sinh Viên - C2C Platform",
      summary:
        "Nền tảng thương mại điện tử mua bán đồ cũ dành riêng cho cộng đồng sinh viên đại học. Được xây dựng với Next.js và NestJS.",
    },
    {
      title: "TimMach - Hệ thống AI Y tế",
      summary:
        "Dự án phân tích rủi ro tim mạch và đề xuất tập luyện đa dịch vụ bằng React, Golang (Gin), và FastAPI Python.",
    },
    {
      title: "AI-WAF Reporter (VNETWORK)",
      summary:
        "Hạ tầng tạo báo cáo kỹ thuật, quản lý workflow tự động hóa, lập lịch sinh PDF và gửi Email theo định kỳ hoạt động với PostgreSQL.",
    },
  ],
  registryCards: [
    {
      name: "Todo.app",
      status: "Live",
      summary: "Ứng dụng trực tiếp khởi chạy trong Private Workspace hỗ trợ thao tác hàng ngày.",
    },
    {
      name: "Files Obj",
      status: "Registered",
      summary: "Kế hoạch xây dựng phân vùng lưu trữ tài liệu cấu trúc và Asset dùng nội bộ.",
    },
    {
      name: "Cron Jobs",
      status: "Registered",
      summary: "Hệ thống Automation thông minh dự kiến xử lý các công việc chạy ngầm (Background tasks).",
    },
  ],
  architectureSignals: [
    "API Design",
    "Secure Access (JWT)",
    "Data Modeling (pgx)",
    "Goose Migrations",
    "Modular React",
  ],
};
