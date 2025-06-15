import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { User } from "../../types/types";

const ProfileInfo = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (err) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return null;
    }

    return (
        <div className="flex w-full items-center gap-6">
            <div className="">
                <img src="https://github.com/shadcn.png" alt="Profile Picture" className="w-32 h-32 rounded-full" />
            </div>
            <div className="">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-2">
                    {user?.username}
                </h2>
                <p className="text-sm text-foreground/60">
                    {user?.email}
                </p>
            </div>
        </div>
    )
}

export default ProfileInfo;