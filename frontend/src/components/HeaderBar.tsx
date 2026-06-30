import { ServiceStatus } from "./ServiceStatus";

type HeaderBarProps = {
  serviceMode: string;
  isHealthy: boolean;
};

export function HeaderBar({ serviceMode, isHealthy }: HeaderBarProps) {
  return (
    <header className="header-bar">
      <div>
        <p className="brand-kicker">MatchMind One</p>
        <p className="brand-subtitle">Built for premium football broadcasts</p>
      </div>
      <ServiceStatus serviceMode={serviceMode} isHealthy={isHealthy} />
    </header>
  );
}
