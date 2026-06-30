import { ServiceStatus } from "./ServiceStatus";

type HeaderBarProps = {
  serviceMode: string;
  databaseBackend: string;
  isHealthy: boolean;
};

export function HeaderBar({ serviceMode, databaseBackend, isHealthy }: HeaderBarProps) {
  return (
    <header className="header-bar">
      <div>
        <p className="brand-kicker">MatchMind One</p>
        <p className="brand-subtitle">Built for premium football broadcasts</p>
      </div>
      <ServiceStatus serviceMode={serviceMode} databaseBackend={databaseBackend} isHealthy={isHealthy} />
    </header>
  );
}
