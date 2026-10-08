import type { ReactNode } from "react";

interface StatCardProps {
  title: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  type?: string;
}

function StatCard({ title, value, description, type }: StatCardProps) {
  return (
    <div className={`stat-card ${type || ""}`}>

      <div className="stat-card-top">

        <div>
          <span className="stat-title">
            {title}
          </span>

          <strong className="stat-value">
            {value}
          </strong>
        </div>

      </div>

      {description && (
        <div className="stat-description">
          {description}
        </div>
      )}

    </div>
  );
}

export default StatCard;