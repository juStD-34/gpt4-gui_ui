import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, FirebaseStorage } from "firebase/storage";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Thông tin cấu hình Firebase (copy từ Firebase Console)
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDeNXiXnnhLMO52m3MxJkLJFfD6zpiKs3A",
  authDomain: "gpt4-gui.firebaseapp.com",
  projectId: "gpt4-gui",
  storageBucket: "gpt4-gui.firebasestorage.app",
  messagingSenderId: "476310255917",
  appId: "1:476310255917:web:74037d4a68184724ce3ba4"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Storage và export
const storage: FirebaseStorage = getStorage(app);

export { storage, ref, getDownloadURL };

// // Thay thông tin config này bằng thông tin Firebase của bạn
// const firebaseConfig = {
//     apiKey: "AIzaSyDeNXiXnnhLMO52m3MxJkLJFfD6zpiKs3A",
//     authDomain: "gpt4-gui.firebaseapp.com",
//     projectId: "gpt4-gui",
//     storageBucket: "gpt4-gui.firebasestorage.app",
//     messagingSenderId: "476310255917",
//     appId: "1:476310255917:web:74037d4a68184724ce3ba4"
//   };
  

// // Khởi tạo Firebase
// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);

// export { storage, ref, getDownloadURL };
