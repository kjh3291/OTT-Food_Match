// firebase.js

// 1. Firebase 코어 및 인증(Auth) 기능 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Firebase 프로젝트 설정값 
const firebaseConfig = {
    apiKey: "AIzaSyBVezh5rDCzPEahnBK7XWQBCQqYwS-nZqw",
    authDomain: "fott-9fedf.firebaseapp.com",
    projectId: "fott-9fedf",
    storageBucket: "fott-9fedf.firebasestorage.app",
    messagingSenderId: "362984265665",
    appId: "1:362984265665:web:f04443593aaa7ccf8b8140"
};

// 3. Firebase 앱 및 인증/DB 객체 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 4. HTML에서 구글 로그인 버튼 가져오기
const loginBtn = document.getElementById('googleLoginBtn');
provider.setCustomParameters({
    prompt: 'select_account'
});

// 5. 사용자 로그인 상태 감지
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginBtn) loginBtn.textContent = '로그아웃';
        console.log("🟢 현재 로그인된 사용자:", user.displayName, user.email);
    } else {
        if (loginBtn) loginBtn.textContent = '구글 로그인';
        console.log("🔴 완전히 로그아웃 되었습니다. 현재 로그인된 계정 없음.");
    }
});

// 6. 구글 로그인 버튼 클릭 이벤트 처리
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            if (auth.currentUser) {
                await signOut(auth);
                alert("성공적으로 로그아웃 되었습니다.");
            } else {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                setTimeout(() => {
                    alert(`${user.displayName}님 환영합니다! 🎉`);
                }, 500);
            }
        } catch (error) {
            console.error("로그인/로그아웃 진행 중 에러 발생:", error);
        }
    });
}


export { auth, db };