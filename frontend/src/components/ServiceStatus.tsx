type ServiceStatusProps = {
  serviceMode: string;
  databaseBackend: string;
  isHealthy: boolean;
};

export function ServiceStatus({ serviceMode, databaseBackend, isHealthy }: ServiceStatusProps) {
  return (
    <div className={isHealthy ? "status-pill" : "status-pill status-pill-error"}>
      {isHealthy ? `Service Ready | ${serviceMode} | ${databaseBackend}` : "Service Warning"}
    </div>
  );
}
