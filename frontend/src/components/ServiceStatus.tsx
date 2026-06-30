type ServiceStatusProps = {
  serviceMode: string;
  isHealthy: boolean;
};

export function ServiceStatus({ serviceMode, isHealthy }: ServiceStatusProps) {
  return (
    <div className={isHealthy ? "status-pill" : "status-pill status-pill-error"}>
      {isHealthy ? `Service Ready • ${serviceMode}` : "Service Warning"}
    </div>
  );
}
