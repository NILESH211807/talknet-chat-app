import { AuthProvider } from "../context/Auth";
import AppLayout from "./AppLayout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
    )
}

export default ProtectedRoute;
