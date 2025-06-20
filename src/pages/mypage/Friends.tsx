import { useEffect, useState } from "react";
import { useAuthFetch } from "../../utils/useAuthFetch";
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
  const authFetch = useAuthFetch();
  const { isSharing, toggleSharing, showFriendsOnMap, toggleShowFriends } = useLocationContext();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestReceived[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestSent[]>([]);
  const [error, setError] = useState<string>("");

  const fetchAllData = async () => {
    try {
      const [friendsRes, receivedRes, sentRes] = await Promise.all([
        authFetch("http://localhost:8080/friends"),
        authFetch("http://localhost:8080/friends/request/received"),
        authFetch("http://localhost:8080/friends/request/sent"),
      ]);

      if (!friendsRes.ok || !receivedRes.ok || !sentRes.ok) {
        throw new Error("데이터 요청 실패");
      }

      const [friendsData, receivedData, sentData]: [Friend[], FriendRequestReceived[], FriendRequestSent[]] =
        await Promise.all([friendsRes.json(), receivedRes.json(), sentRes.json()]);

      setFriends(friendsData);
      setReceivedRequests(receivedData);
      setSentRequests(sentData);
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
      const res = await authFetch(`http://localhost:8080/friends/request/accept/${requesterId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("수락 실패");
      alert("✅ 친구 요청을 수락했습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 수락 실패:", err);
    }
  };

  const handleReject = async (requesterId: number) => {
    try {
      const res = await authFetch(`http://localhost:8080/friends/request/reject/${requesterId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("거절 실패");
      alert("🚫 친구 요청을 거절했습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 거절 실패:", err);
    }
  };

  const handleDelete = async (friendId: number) => {
    if (!window.confirm("정말 친구를 삭제하시겠습니까?")) return;
    try {
      const res = await authFetch(`http://localhost:8080/friends/${friendId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      alert("🗑️ 친구가 삭제되었습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
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
