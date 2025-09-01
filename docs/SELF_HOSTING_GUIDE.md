# Self-Hosting Guide

## About LibreSpeed
The default LibreSpeed URL is for demonstration purposes only. For production or private use, you should set up your own LibreSpeed server.

## Setting Up Your Own LibreSpeed Server
1. Visit the [LibreSpeed GitHub](https://github.com/librespeed/speedtest) for installation instructions.
2. Deploy the server on your preferred environment (local, cloud, VPS).
3. Ensure your server is accessible from your app or users.

## Pointing the App to Your Server
- Update the environment variable in your `.env` file:
  ```env
  LIBRESPEED_URL=https://your-librespeed-server.com
  ```
- Restart the app to apply changes.

## Notes
- The app will use the URL specified in the environment variable.
- For advanced configuration, refer to the LibreSpeed documentation.

---

For architecture details, see [Architecture Guide](ARCHITECTURE.md).
