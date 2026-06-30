type StateNoticeProps = {
  title: string;
  message: string;
  tone?: "info" | "error";
};

export function StateNotice({ title, message, tone = "info" }: StateNoticeProps) {
  return (
    <div className={tone === "error" ? "state-notice state-notice-error" : "state-notice"}>
      <p className="section-label">{title}</p>
      <p>{message}</p>
    </div>
  );
}
