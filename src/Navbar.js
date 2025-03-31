import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <CustomLink to="/">Yönetim</CustomLink>
      </div>
      <div className="nav-right">
        <CustomLink to="/Telemetry">Telemetry</CustomLink>
      </div>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <div className={isActive ? "active nav-item" : "nav-item"}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </div>
  );
}
