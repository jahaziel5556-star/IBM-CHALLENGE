import type { ProfileSettings } from "../types/domain";

type SettingsPanelProps = {
  settings: ProfileSettings;
  onToggle: (field: "large_text" | "high_contrast" | "reduced_motion", value: boolean) => void;
};

export function SettingsPanel({ settings, onToggle }: SettingsPanelProps) {
  return (
    <div>
      <p className="section-label">Accessibility</p>
      <div className="settings-list">
        <label className="setting-row">
          <span>Large text</span>
          <input
            type="checkbox"
            checked={settings.large_text}
            onChange={(event) => onToggle("large_text", event.target.checked)}
          />
        </label>
        <label className="setting-row">
          <span>High contrast</span>
          <input
            type="checkbox"
            checked={settings.high_contrast}
            onChange={(event) => onToggle("high_contrast", event.target.checked)}
          />
        </label>
        <label className="setting-row">
          <span>Reduced motion</span>
          <input
            type="checkbox"
            checked={settings.reduced_motion}
            onChange={(event) => onToggle("reduced_motion", event.target.checked)}
          />
        </label>
      </div>
    </div>
  );
}
