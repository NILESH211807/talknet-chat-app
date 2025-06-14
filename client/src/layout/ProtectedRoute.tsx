import { AuthProvider } from "../context/Auth";
import { SocketProvider } from "../context/socket";
import AppLayout from "./AppLayout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <SocketProvider>
                <AppLayout>{children}</AppLayout>
            </SocketProvider>
        </AuthProvider>
    )
}

export default ProtectedRoute;
