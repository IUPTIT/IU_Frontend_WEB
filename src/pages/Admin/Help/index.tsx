import { LifeBuoy } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

/** Trợ giúp — placeholder chờ nội dung thiết kế. */
export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trợ giúp"
        description="Hướng dẫn sử dụng hệ thống, FAQ và liên hệ hỗ trợ."
      />
      <div className="neu-card">
        <EmptyState
          icon={LifeBuoy}
          title="Nội dung đang được soạn"
          description="FAQ, hướng dẫn theo role và kênh hỗ trợ sẽ xuất hiện tại đây khi có bản thiết kế."
        />
      </div>
    </div>
  );
}
