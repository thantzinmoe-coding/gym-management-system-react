import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export function useSecureAvatar(url: string | null | undefined) {
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    if (!url) return;

    let isMounted = true;
    const fetchAvatar = async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch avatar");

        const blob = await response.blob();
        if (isMounted) {
          setAvatar(URL.createObjectURL(blob));
        }
      } catch {
        if (isMounted) {
          setAvatar("");
        }
      }
    };

    fetchAvatar();
    
    return () => {
      isMounted = false;
    };
  }, [url]);

  return avatar;
}

interface SecureAvatarProps {
  url?: string | null;
  name?: string;
  className?: string;
}

export function SecureAvatar({ url, name = "User", className = "w-10 h-10" }: SecureAvatarProps) {
  const avatar = useSecureAvatar(url);

  if (!url || !avatar) {
    // Show initials if no avatar or fetch failed
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // limit to 2 letters

    return (
      <div className={`flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold border border-blue-200 ${className}`}>
        {initials || "U"}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      className={`rounded-full object-cover border border-gray-200 ${className}`}
    />
  );
}
