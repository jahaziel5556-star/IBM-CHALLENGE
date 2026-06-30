import type { ProfileId } from "../types/domain";

type ProfileSwitcherProps = {
  profiles: ProfileId[];
  activeProfile: ProfileId;
  onChange: (profile: ProfileId) => void | Promise<void>;
};

export function ProfileSwitcher({ profiles, activeProfile, onChange }: ProfileSwitcherProps) {
  return (
    <div>
      <p className="section-label">Viewer Profile</p>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <button
            key={profile}
            className={profile === activeProfile ? "profile-chip profile-chip-active" : "profile-chip"}
            onClick={() => void onChange(profile)}
          >
            {profile.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
