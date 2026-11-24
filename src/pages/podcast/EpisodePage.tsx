import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { getAuthor } from "@/content/content";
import { MdxProvider } from "@/components/MdxProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import NotFound from "@/pages/NotFound";
import {
  SHOW,
  episodeJsonLd,
  episodeNumber,
  episodePath,
  episodeTitle,
  episodes,
  formatEpisodeDate,
  getEpisode,
  humanDuration,
  loadTranscript,
  transcriptSync,
  loadWriteup,
  writeupFor,
  writeupSync,
  youtubeFor,
} from "@/content/podcast";
import { SITE_URL } from "@/lib/seo";
import { ListenLinks } from "./PodcastIndex";

/** Speaker lines look like "Scott Haines: text". */
const Transcript = ({ text }: { text: string }) => (
  <div className="flex flex-col gap-4 text-[0.95rem] leading-relaxed">
    {text
      .split(/\n{2,}/)
      .filter((p) => p.trim())
      .map((para, i) => {
        const m = para.match(/^([A-Z][\w .'-]{1,40}):\s([\s\S]*)$/);
        return m ? (
          <p key={i}>
            <strong className="font-semibold text-foreground">{m[1]}:</strong> {m[2]}
          </p>
        ) : (
          <p key={i}>{para}</p>
        );
      })}
  </div>
);

const EpisodePage = () => {
  const { slug = "" } = useParams();
  const episode = getEpisode(slug);
  const [transcript, setTranscript] = useState<string | undefined>(() => transcriptSync(slug));
  const meta = episode ? writeupFor(episode) : undefined;
  const [Writeup, setWriteup] = useState(() => writeupSync(slug));

  useEffect(() => {
    if (!transcript && episode?.hasTranscript) loadTranscript(slug).then(setTranscript);
  }, [slug, episode, transcript]);
  useEffect(() => {
    // Client-side navigation between episodes: load this episode's write-up.
    const cached = writeupSync(slug);
    if (cached) setWriteup(() => cached);
    else if (meta) loadWriteup(slug).then((c) => c && setWriteup(() => c));
  }, [slug, meta]);

  if (!episode) return <NotFound />;

  const video = youtubeFor(episode);
  const authors = (meta?.authors ?? []).map(getAuthor).filter(Boolean);
  const heading = episodeTitle(episode);
  const description = meta?.excerpt ?? (episode.summary.length > 300 ? `${episode.summary.slice(0, 297)}...` : episode.summary);
  const idx = episodes.indexOf(episode);
  const newer = episodes[idx - 1];
  const older = episodes[idx + 1];
  const label = `Episode ${episodeNumber(episode)}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Podcast", item: `${SITE_URL}${SHOW.path}` },
      { "@type": "ListItem", position: 3, name: heading, item: `${SITE_URL}${episodePath(episode)}` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${heading} | ${SHOW.title}`}
        description={description}
        path={episodePath(episode)}
        type="article"
        image={episode.image}
        suffix={false}
        jsonLd={[episodeJsonLd(episode), breadcrumbJsonLd]}
      />
      <SiteHeader />
      <main className="flex-1">
        <article className="container max-w-3xl pb-24 pt-14 md:pt-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to={SHOW.path} className="hover:text-foreground">Podcast</Link>
            <span className="mx-2">/</span>
            <span aria-current="page">{label}</span>
          </nav>

          <header className="flex flex-col gap-4">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <Link to={SHOW.path} className="text-primary hover:underline">{SHOW.title}</Link>
              <span>{label}</span>
              <time dateTime={episode.date}>{formatEpisodeDate(episode.date)}</time>
              {episode.duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden="true" className="h-3 w-3" /> {humanDuration(episode.duration)}
                </span>
              )}
            </p>
            <h1 className="text-balance text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
              {heading}
            </h1>
            {authors.length > 0 && (
              <p className="text-sm text-muted-foreground">
                By{" "}
                {authors.map((a, i) => (
                  <span key={a.slug}>
                    {i > 0 && " and "}
                    <Link to={`/authors/${a.slug}`} className="font-medium text-foreground hover:underline">{a.name}</Link>
                  </span>
                ))}
              </p>
            )}
          </header>

          {video && <YouTubeEmbed videoId={video.id} title={episode.title} />}
          {Writeup && (
            <div className="prose post-article mt-10">
              <MdxProvider>
                <Writeup />
              </MdxProvider>
            </div>
          )}

          <h2 className="mt-14 text-2xl font-semibold tracking-tight">Listen</h2>

          <audio controls preload="none" className="mt-4 w-full">
            <source src={episode.audioUrl} type={episode.audioType} />
            <a href={episode.audioUrl}>Download the episode</a>
          </audio>
          <ListenLinks className="mt-4" />

          <section aria-labelledby="notes-heading" className="mt-12">
            <h2 id="notes-heading" className="mb-4 text-2xl font-semibold tracking-tight">Show notes</h2>
            <div
              className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: episode.notesHtml }}
            />
          </section>

          {episode.hasTranscript && (
            <section aria-labelledby="transcript-heading" className="mt-12">
              <h2 id="transcript-heading" className="mb-2 text-2xl font-semibold tracking-tight">Transcript</h2>
              <p className="mb-6 text-sm text-muted-foreground">Machine-generated; may contain errors.</p>
              <details className="group rounded-2xl border border-border bg-card p-6">
                <summary className="cursor-pointer font-medium text-primary">Show the full transcript</summary>
                <div className="mt-6 text-muted-foreground">
                  {transcript ? <Transcript text={transcript} /> : <p>Loading the transcript...</p>}
                </div>
              </details>
            </section>
          )}

          <nav aria-label="More episodes" className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {older ? (
              <Link to={episodePath(older)} className="rounded-xl border border-border p-4 hover:border-primary/40">
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">Previous episode</span>
                <span className="mt-1 block font-medium">{episodeTitle(older)}</span>
              </Link>
            ) : <span />}
            {newer && (
              <Link to={episodePath(newer)} className="rounded-xl border border-border p-4 text-right hover:border-primary/40">
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">Next episode</span>
                <span className="mt-1 block font-medium">{episodeTitle(newer)}</span>
              </Link>
            )}
          </nav>
          <Link to={SHOW.path} className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All episodes
          </Link>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};

export default EpisodePage;
