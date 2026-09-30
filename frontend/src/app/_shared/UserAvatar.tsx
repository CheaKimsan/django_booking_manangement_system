interface Props {
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  profilePicture?: string | null;
  size?: number;
}

const UserAvatar = ({ firstName, lastName, username, profilePicture, size = 32 }: Props) => {
  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={username}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  const initials =
    ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase() ||
    username.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "#334155", color: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: 600,
      }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;