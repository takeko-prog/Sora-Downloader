import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json());

app.post("/sora-download", async (req, res) => {
  const { sora_url } = req.body;

  if (!sora_url) {
    return res.status(400).json({ error: "sora_url required" });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let videoUrl = null;

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes(".mp4")) {
      videoUrl = url;
    }
  });

  await page.goto(sora_url, { waitUntil: "networkidle" });
  await page.waitForTimeout(6000);
  await browser.close();

  if (!videoUrl) {
    return res.status(500).json({ error: "Video not found" });
  }

  res.json({
    success: true,
    video_url: videoUrl
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
