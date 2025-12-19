export function InlineMessage({
  kind,
  message
}: {
  kind: 'error' | 'success' | 'info';
  message?: string;
}) {
  if (!message) return null;
  const cls = kind === 'error' ? 'error' : kind === 'success' ? 'success' : '';
  return (
    <div className={cls} style={{ padding: '8px 0' }}>
      {message}
    </div>
  );
}
