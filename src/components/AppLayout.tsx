import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import styles from "./appLayout.module.css";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        <button className={styles.homeButton} onClick={() => navigate("/home")}>
          🏠 홈으로
        </button>
      </header>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default AppLayout;
