import { Routes, Route } from "react-router-dom";
import Home from "./pages/mainpage/Home";
import LoginPage from "./pages/mainpage/LoginPage";
import LoginKakkoCallback from "./pages/mainpage/LoginKakkoCallback";
import MyRecords from "./pages/records/MyRecords";
import DetailMyRecord from "./pages/records/DetailMyRecord";
import Courses from "./pages/courses/Courses";
import CourseDetail from "./pages/courses/CourseDetail";
import MyPage from "./pages/mypage/MyPage";
import RecoverPage from "./pages/recovery/RecoverPage";
import RunPage from "./pages/RunPage";
import PopularCourses from "./pages/courses/PopularCourses";
import CourseStats from "./pages/courses/CourseStats";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LocationProvider } from "./contexts/LocationContext";

const App: React.FC = () => {
  return (
    <LocationProvider>
      <AppLayout>
        <Routes>
          {/* ❌ 로그인 관련 경로 (보호 안 함) */}
          <Route path='/' element={<LoginPage />} />
          <Route path='/login/callback' element={<LoginKakkoCallback />} />

          {/* ✅ 보호된 경로들 */}
          <Route
            path='/home'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-records'
            element={
              <ProtectedRoute>
                <MyRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-records/:id'
            element={
              <ProtectedRoute>
                <DetailMyRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path='/courses'
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path='/course/:id'
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path='/mypage'
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/recover'
            element={
              <ProtectedRoute>
                <RecoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/run'
            element={
              <ProtectedRoute>
                <RunPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/courses/popular'
            element={
              <ProtectedRoute>
                <PopularCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path='/courses/:id/stats'
            element={
              <ProtectedRoute>
                <CourseStats />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </LocationProvider>
  );
};

export default App;
