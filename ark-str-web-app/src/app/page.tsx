import { readReaderHomeModel } from "@/features/content/service/read-content-index";
import { readContentReadiness } from "@/features/content/service/read-content-readiness";
import { BootstrapHome } from "@/features/bootstrap/ui/bootstrap-home";

export default function Home() {
  return (
    <BootstrapHome
      homeModel={readReaderHomeModel()}
      readiness={readContentReadiness()}
    />
  );
}
