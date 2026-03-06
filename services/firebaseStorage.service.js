// services/firebaseStorage.service.js
const sanitize = require("sanitize-filename");
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
  uploadBytes,
  listAll,
} = require("firebase/storage");

require("dotenv").config();

/**
 * Firebase configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyBvzDfiJg9KSX5TwPnlEzJsWmMZT1LVjoc",
  authDomain: "live-playground-9bdc2.firebaseapp.com",
  projectId: "live-playground-9bdc2",
  storageBucket: "live-playground-9bdc2.firebasestorage.app",
  messagingSenderId: "341816875148",
  appId: "1:341816875148:web:aa3944491a3f07888bc3a9",
  measurementId: "G-0EL0Q8396S",
};

class FirebaseStorageService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
  }

  /**
   * Upload single file
   */
  async uploadFile(roomPath, file) {
    try {
      console.info(
        `🔃 Starting upload for ${file?.originalname || "Unknown file"}`,
      );

      const { mimetype, buffer, originalname } = file;

      const safeFileName = sanitize(originalname);

      const filePath = `${roomPath}/${safeFileName}`;
      console.log("filePath", filePath);

      const storageRef = ref(this.storage, filePath);

      // try {
      //   const existing = await getDownloadURL(storageRef);
      //   if (existing) {
      //     return {
      //       publicId: originalname,
      //       url: existing,
      //       existing: true,
      //     };
      //   }
      // } catch (err) { }

      const metadata = {
        contentType: mimetype,
      };

      await uploadBytesResumable(storageRef, buffer, metadata);

      const fileUrl = await getDownloadURL(storageRef);

      if (!fileUrl) {
        throw new Error(`Failed to retrieve download URL`);
      }

      return {
        publicId: originalname,
        url: fileUrl,
        existing: false,
      };
    } catch (err) {
      console.error("Firebase Error Details:", {
        code: err.code,
        message: err.message,
        status: err.status_,
        serverResponse: err.customData?.serverResponse,
      });
      throw err;
    }
  }

  async deleteFolder(roomPath) {
    const folderRef = ref(this.storage, `${roomPath}`);

    try {
      const res = await listAll(folderRef);

      if (res.items.length === 0) {
        console.log(`Folder ${roomPath} is already empty.`);
        return;
      }

      await Promise.all(res.items.map((fileRef) => deleteObject(fileRef)));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FirebaseStorageService();
