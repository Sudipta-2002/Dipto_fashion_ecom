import express from 'express';

const router = express.Router();

// GET /api/app/version - App Version Update API for mobile app updates
router.get(['/version', '/api/app/version'], (req, res) => {
  res.json({
    latestVersion: "1.0.0",
    versionCode: 1,
    downloadUrl: "https://diptofashion.in/downloads/dipto-fashion.apk",
    forceUpdate: false,
    releaseNotes: "Bug fixes and performance improvements."
  });
});

export default router;
