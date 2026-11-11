import { useState } from "react";
import "./profile-portrait.css";

export default function ProfilePortrait({ id, initials }: { id: string; initials: string }) {
  const src = `/assets/avatars/${id}.webp`;
  const [failed, setFailed] = useState("");
  return failed === src ? initials : <img className="profile-portrait" src={src} alt="" loading="lazy" decoding="async" width={160} height={160} draggable={false} onError={() => setFailed(src)} />;
}
