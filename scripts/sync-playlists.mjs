#!/usr/bin/env node
/**
 * Sync YouTube playlists into MDX files under src/content/videos/<channel-slug>/.
 *
 * Config: scripts/playlists.json
 * Auth:   process.env.YOUTUBE_API_KEY (YouTube Data API v3)
 *
 * Behaviour:
 *   - For each (channel, playlist), fetch every videoId via playlistItems.list.
 *   - Hydrate title + duration via videos.list (contentDetails + snippet).
 *   - Write one MDX per video at src/content/videos/<channel-slug>/<videoId>.mdx.
 *     Existing files with the same videoId are overwritten, but their `visible`
 *     value is preserved so videos can be hidden without losing that choice.
 *   - Private/unavailable playlist entries are retained with `visible: false`.
 *   - Files in those channel dirs that are no longer in any playlist are removed,
 *     UNLESS their frontmatter has `manual: true` (placeholders / hand-curated).
 *   - Channels not present in scripts/playlists.json are left fully untouched.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... node scripts/sync-playlists.mjs
 *   YOUTUBE_API_KEY=... node scripts/sync-playlists.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VIDEOS_DIR = path.join(ROOT, "src/content/videos");
const CONFIG = path.join(__dirname, "playlists.json");

const DRY_RUN = process.argv.includes("--dry-run");
const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error("YOUTUBE_API_KEY is required. Get one at https://console.cloud.google.com → APIs & Services → YouTube Data API v3.");
  process.exit(1);
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Convert ISO 8601 duration (PT1H2M3S) to "1:02:03" / "2:03". */
function isoToClock(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? "");
  if (!m) return "";
  const h = +(m[1] || 0);
  const min = +(m[2] || 0);
  const s = +(m[3] || 0);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

async function ytGet(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: API_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchPlaylistItems(playlistId) {
  const items = [];
  let pageToken;
  do {
    const data = await ytGet("playlistItems", {
      part: "contentDetails,snippet,status",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    items.push(
      ...data.items.map((item) => ({
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        publishedAt: item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt,
        visible: item.status?.privacyStatus === "public",
      })),
    );
    pageToken = data.nextPageToken;
  } while (pageToken);
  return items;
}

async function fetchVideoDetails(ids) {
  const out = new Map();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const data = await ytGet("videos", {
      part: "snippet,contentDetails",
      id: chunk.join(","),
    });
    for (const v of data.items) {
      out.set(v.id, {
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        duration: isoToClock(v.contentDetails.duration),
      });
    }
  }
  return out;
}

function yamlEscape(s) {
  // Always double-quote and escape backslashes + double quotes — safest for arbitrary titles.
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function renderMdx({ channel, title, duration, hue, videoId, playlist, publishedAt, visible }) {
  const fm = [
    `channel: ${yamlEscape(channel)}`,
    `title: ${yamlEscape(title)}`,
    `duration: "${duration}"`,
    `hue: ${hue}`,
    `videoId: "${videoId}"`,
    `visible: ${visible}`,
    playlist ? `playlist: "${playlist}"` : null,
    publishedAt ? `publishedAt: "${publishedAt}"` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return `---\n${fm}\n---\n\n<YouTubeEmbed videoId="${videoId}"${
    playlist ? ` playlist="${playlist}"` : ""
  } title=${yamlEscape(title)} />\n`;
}

function readFrontmatter(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const m = /^---\n([\s\S]*?)\n---/.exec(raw);
    if (!m) return {};
    const fm = {};
    for (const line of m[1].split("\n")) {
      const [k, ...rest] = line.split(":");
      if (!k || !rest.length) continue;
      fm[k.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
    }
    return fm;
  } catch {
    return {};
  }
}

async function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
  let added = 0;
  let updated = 0;
  let removed = 0;

  for (const channel of config.channels) {
    const slug = slugify(channel.name);
    const dir = path.join(VIDEOS_DIR, slug);
    if (!DRY_RUN) fs.mkdirSync(dir, { recursive: true });

    // 1. Gather every unique video for this channel.
    const videosById = new Map(); // first playlist wins for canonical link
    for (const playlistId of channel.playlists) {
      const items = await fetchPlaylistItems(playlistId);
      for (const item of items) {
        if (!videosById.has(item.videoId)) videosById.set(item.videoId, { ...item, playlist: playlistId });
      }
    }

    // 2. Hydrate public details. Private/unavailable entries fall back to
    //    playlist metadata and remain in the content set as hidden videos.
    const allIds = [...videosById.keys()];
    const details = await fetchVideoDetails(allIds);

    // 3. Write MDX files (deterministic hue based on position).
    const hueBase = channel.hueBase ?? 270;
    let i = 0;
    for (const [videoId, playlistItem] of videosById) {
      const d = details.get(videoId) ?? playlistItem;
      const file = path.join(dir, `${videoId}.mdx`);
      const exists = fs.existsSync(file);
      const previousFrontmatter = exists ? readFrontmatter(file) : {};
      const visible =
        previousFrontmatter.visible === "true"
          ? true
          : previousFrontmatter.visible === "false"
            ? false
            : playlistItem.visible;
      const next = renderMdx({
        channel: channel.name,
        title: d.title,
        duration: d.duration ?? "",
        hue: hueBase + ((i * 3) % 30) - 15, // small spread around the base
        videoId,
        playlist: playlistItem.playlist,
        publishedAt: d.publishedAt,
        visible,
      });
      const prev = exists ? fs.readFileSync(file, "utf8") : "";
      if (prev !== next) {
        if (!DRY_RUN) fs.writeFileSync(file, next);
        if (exists) updated++;
        else added++;
      }
      i++;
    }

    // 4. Remove MDX files in this channel dir that are no longer in any playlist
    //    (and weren't marked `manual: true`).
    if (fs.existsSync(dir)) {
      for (const name of fs.readdirSync(dir)) {
        if (!name.endsWith(".mdx")) continue;
        const file = path.join(dir, name);
        const fm = readFrontmatter(file);
        const id = fm.videoId;
        if (id && videosById.has(id)) continue;
        if (fm.manual === "true") continue;
        if (!id) continue; // skip hand-written entries without videoId
        if (!DRY_RUN) fs.unlinkSync(file);
        removed++;
      }
    }
  }

  console.log(
    `${DRY_RUN ? "[dry-run] " : ""}sync complete — added: ${added}, updated: ${updated}, removed: ${removed}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
