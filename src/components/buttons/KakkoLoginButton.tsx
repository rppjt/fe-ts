import "./KakkoLoginButton.css"; // ✅ 기존 CSS 그대로 사용

const KakkoLoginButton = () => {
  const handleLogin = (): void => {
    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
  };

  return (
    <button onClick={handleLogin} className='kakao-button'>
      <img src='/kakkologo.png' alt='Kakao Login' className='kakao-login-img' />
    </button>
  );
};

export default KakkoLoginButton;
