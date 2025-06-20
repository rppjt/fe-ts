import styles from "./Loginpage.module.css";
import KakkoLoginButton from "../../components/buttons/KakkoLoginButton";

const Loginpage: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <img src='/home.jpg' alt='background' className={styles.fullBg} />
      <div className={styles.overlay}>
        <h1 className={styles.title}>Runsh</h1>
        <KakkoLoginButton />
      </div>
    </div>
  );
};

export default Loginpage;
