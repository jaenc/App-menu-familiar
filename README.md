<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1olJIwGrw4AqEDTu_V3Dc4gW5CvgEn8le

## Run Locally

**Prerequisites:**

*   Node.js
*   A Google Cloud project with Firebase (including Authentication and Firestore) and the Gemini API enabled.

**Setup:**

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a file named `.env.local` in the root of your project. Copy the contents of your Firebase project's web app configuration and your Gemini API key into it.

    The file should look like this:

    ```env
    # Get this from the Gemini API dashboard
    GEMINI_API_KEY="AIza..."

    # Get these from your Firebase project settings > General > Your apps > Web app > SDK setup and configuration
    FIREBASE_API_KEY="AIza..."
    FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    FIREBASE_PROJECT_ID="your-project-id"
    FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    FIREBASE_MESSAGING_SENDER_ID="1234567890"
    FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
    ```

3.  **Run the app:**
    ```bash
    npm run dev
    ```
    Your app should now be running locally. The application will not work correctly until the `.env.local` file is properly configured.