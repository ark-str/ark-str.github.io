import { readContentReadiness } from "@/features/content/service/read-content-readiness";
import { BootstrapHome } from "@/features/bootstrap/ui/bootstrap-home";

export default function Home() {
  return <BootstrapHome readiness={readContentReadiness()} />;
}
