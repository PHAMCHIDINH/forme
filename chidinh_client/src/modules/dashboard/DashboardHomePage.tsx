import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";

export function DashboardHomePage() {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="LÕI HỆ THỐNG"
        title="Tổng Quan Không Gian Làm Việc"
        description="Giao diện cá nhân hóa dùng để tương tác trực tiếp, theo dõi dữ liệu và điều phối các dự án hệ thống."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="bg-[#ffdb33] border-4">
          <p className="font-bold text-xs uppercase tracking-widest text-[#5a5a5a] bg-white border-2 border-border px-2 py-1 inline-block mb-2">Module Hoạt Động</p>
          <h3 className="text-2xl font-head uppercase text-foreground">Công Việc (Tasks)</h3>
          <p className="mt-3 text-sm font-medium text-foreground">
            Ghi nhận và thực thi ngay lập tức các tác vụ trong ngày.
          </p>
        </Panel>

        <Panel className="bg-[#ff6b6b] text-white border-4 border-border">
          <p className="font-bold text-xs uppercase tracking-widest text-[#000] bg-white border-2 border-border px-2 py-1 inline-block mb-2">Đã Kích Hoạt</p>
          <h3 className="text-2xl font-head uppercase text-white">Tài Liệu (Files)</h3>
          <p className="mt-3 text-sm font-medium text-white">
            Khu vực lưu trữ các file thiết kế cấu trúc và tư liệu tham chiếu.
          </p>
        </Panel>

        <Panel className="bg-[#3a3a3a] text-white border-4 border-border">
          <p className="font-bold text-xs uppercase tracking-widest text-[#000] bg-white border-2 border-border px-2 py-1 inline-block mb-2">Đã Kích Hoạt</p>
          <h3 className="text-2xl font-head uppercase text-white">Tính Năng Định Kỳ</h3>
          <p className="mt-3 text-sm font-medium text-white/90">
            Hệ thống pipeline tự động chạy luồng công việc quy trình.
          </p>
        </Panel>
      </div>
    </section>
  );
}
