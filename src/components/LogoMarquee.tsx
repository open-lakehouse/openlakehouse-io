import { useState } from "react";
import icebergLogo from "@/assets/logos/iceberg.svg";
import deltaLakeLogo from "@/assets/logos/delta-lake.svg";
import unityCatalogLogo from "@/assets/logos/unity-catalog.svg";
import polarisLogo from "@/assets/logos/apache-polaris.svg";
import openLineageLogo from "@/assets/logos/openlineage.svg";
import lakekeeperLogo from "@/assets/logos/lakekeeper.svg";

type Logo = { name: string; slug?: string; src?: string; mono?: boolean; hideName?: boolean; widthClass?: string };

const logos: Logo[] = [
  { name: "Apache Spark", slug: "apachespark" },
  { name: "Apache Flink", slug: "apacheflink" },
  { name: "DataFusion", slug: "apachearrow" },
  { name: "Unity Catalog", src: unityCatalogLogo },
  { name: "Apache Polaris", src: polarisLogo, mono: true, hideName: true, widthClass: "w-32" },
  { name: "Lakekeeper", src: lakekeeperLogo, mono: true, widthClass: "w-8" },
  { name: "MLflow", slug: "mlflow" },
  { name: "Apache Iceberg", src: icebergLogo, hideName: true, widthClass: "w-36" },
  { name: "Delta Lake", src: deltaLakeLogo, mono: true, hideName: true, widthClass: "w-32" },
  { name: "Apache Airflow", slug: "apacheairflow" },
  { name: "Temporal", slug: "temporal" },
  { name: "OpenLineage", src: openLineageLogo, hideName: true, widthClass: "w-36" },
];

const LogoItem = ({ logo }: { logo: Logo }) => {
  const [failed, setFailed] = useState(false);
  const imgSrc = logo.src ?? (logo.slug ? `https://cdn.simpleicons.org/${logo.slug}/ffffff` : undefined);
  const showImg = imgSrc && !failed;
  return (
    <div className="mx-8 md:mx-12 flex items-center gap-3 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
      {showImg && (
        logo.mono ? (
          <span
            aria-label={logo.name}
            role="img"
            className={`h-7 ${logo.widthClass ?? "w-auto"} bg-white dark:bg-white`}
            style={{
              WebkitMaskImage: `url(${imgSrc})`,
              maskImage: `url(${imgSrc})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        ) : (
          <img
            src={imgSrc}
            alt={logo.name}
            className={`h-7 ${logo.widthClass ?? "w-auto max-w-[2.5rem]"} object-contain`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )
      )}
      {!logo.hideName && (
        <span className="whitespace-nowrap text-sm md:text-base font-medium tracking-wide text-white/90">
          {logo.name}
        </span>
      )}
    </div>
  );
};

export const LogoMarquee = () => {
  return (
    <section
      aria-label="Featured open source projects"
      className="relative overflow-hidden border-y border-white/10 bg-brand-gradient py-5"
    >
      <style>{`
        @keyframes logo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-marquee-track {
          animation: logo-marquee 40s linear infinite;
        }
        .logo-marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max logo-marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
            {logos.map((l) => (
              <LogoItem key={`${dup}-${l.name}`} logo={l} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
