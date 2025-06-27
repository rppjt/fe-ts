import { useEffect, useState } from "react";
import authAxios from "../../utils/authAxios";
import { useLocationContext } from "../../contexts/LocationContext";
import styles from "./myPage.module.css";

// ✅ 타입 정의
interface Friend {
  friendId: number;
  name: string;
  profileImage: string;
}

interface FriendRequestReceived {
  requesterId: number;
  name: string;
  profileImage: string;
}

interface FriendRequestSent {
  targetId: number;
  name: string;
  profileImage: string;
}

const Friends: React.FC = () => {
  const { isSharing, toggleSharing, showFriendsOnMap, toggleShowFriends } = useLocationContext();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestReceived[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestSent[]>([]);
  const [error, setError] = useState<string>("");

  const fetchAllData = async () => {
    try {
      const [friendsRes, receivedRes, sentRes] = await Promise.all([
        authAxios.get<Friend[]>("/friends"),
        authAxios.get<FriendRequestReceived[]>("/friends/request/received"),
        authAxios.get<FriendRequestSent[]>("/friends/request/sent"),
      ]);

      setFriends(friendsRes.data);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error("❌ 친구 데이터 불러오기 실패:", err);
      setError("친구 데이터를 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAccept = async (requesterId: number) => {
    try {
      await authAxios.post(`/friends/request/accept/${requesterId}`);
      alert("✅ 친구 요청을 수락했습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 수락 실패:", err);
      alert("❌ 친구 요청 수락 중 오류 발생");
    }
  };

  const handleReject = async (requesterId: number) => {
    try {
      await authAxios.post(`/friends/request/reject/${requesterId}`);
      alert("🚫 친구 요청을 거절했습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 거절 실패:", err);
      alert("❌ 친구 요청 거절 중 오류 발생");
    }
  };

  const handleDelete = async (friendId: number) => {
    if (!window.confirm("정말 친구를 삭제하시겠습니까?")) return;

    try {
      await authAxios.delete(`/friends/${friendId}`);
      alert("🗑️ 친구가 삭제되었습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("❌ 친구 삭제 중 오류 발생");
    }
  };

  return (
    <div className={styles.container}>
      <h2>👥 친구 목록</h2>

      <div className={styles.toggleContainer}>
        <label className={styles.switch}>
          <input type='checkbox' checked={isSharing} onChange={toggleSharing} />
          <span className={styles.slider}></span>
        </label>
        <span className={styles.toggleLabel}>📡 내 위치 공유</span>

        <label className={styles.switch}>
          <input type='checkbox' checked={showFriendsOnMap} onChange={toggleShowFriends} />
          <span className={styles.slider}></span>
        </label>
        <span className={styles.toggleLabel}>🗺️ 친구 위치 보기</span>
      </div>

      {friends.map((f) => (
        <div key={f.friendId} className={styles.friendCard}>
          <img src={f.profileImage} alt='프로필' className={styles.profileImg} />
          <span>{f.name}</span>
          <button onClick={() => handleDelete(f.friendId)}>삭제</button>
        </div>
      ))}

      <h3>📨 받은 친구 요청</h3>
      {receivedRequests.map((req) => (
        <div key={req.requesterId} className={styles.friendCard}>
          <img src={req.profileImage} alt='프로필' className={styles.profileImg} />
          <span>{req.name}</span>
          <button onClick={() => handleAccept(req.requesterId)}>수락</button>
          <button onClick={() => handleReject(req.requesterId)}>거절</button>
        </div>
      ))}

      <h3>📤 보낸 친구 요청</h3>
      {sentRequests.map((req) => (
        <div key={req.targetId} className={styles.friendCard}>
          <img src={req.profileImage} alt='프로필' className={styles.profileImg} />
          <span>{req.name}</span>
          <span className={styles.pending}>⏳ 대기중</span>
        </div>
      ))}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Friends;
