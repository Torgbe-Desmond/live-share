// services/firebaseStorage.service.js

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
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

class FirebaseStorageService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
  }

  /**
   * Upload single file
   */
  async uploadFile(roomId, file) {
    try {
      console.info(
        `🔃 Starting upload for ${file?.originalname || "Unknown file"}`
      );

      const { mimetype, buffer, originalname } = file;

      const storageRef = ref(
        this.storage,
        `rooms/${roomId}/${originalname}`
      );


      try {
        const existing = await getDownloadURL(storageRef);
        if (existing) {
          return {
            publicId: originalname,
            url: existing,
            existing: true,
          };
        }
      } catch (err) { }

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

    } catch (error) {
      throw error;
    }
  }


async deleteFolder(roomId, folderName) {
  const folderRef = ref(this.storage, `rooms/${roomId}/${folderName}`);

  try {
    const res = await listAll(folderRef);

    if (res.items.length === 0) {
      console.log(`Folder ${folderName} is already empty.`);
      return;
    }

    await Promise.all(res.items.map((fileRef) => deleteObject(fileRef)));

  } catch (error) {
    throw error;
  }
}

}

module.exports = new FirebaseStorageService();