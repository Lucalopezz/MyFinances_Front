import { PrivateLoading } from "@/components/layout/private-loading";

// Fallback do App Router para o grupo privado. Rotas com loading.tsx próprio
// mantêm seus skeletons específicos; o layout reutiliza este mesmo componente
// quando o catálogo está pendente, para manter a apresentação consistente.
export default PrivateLoading;
