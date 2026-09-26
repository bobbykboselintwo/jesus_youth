export default function ProgressBar({ percent }) {
  return (
    <div className="progress">
      <div className="progress-bar" style={{ width: `${percent}%` }} />
    </div>
  );
}
