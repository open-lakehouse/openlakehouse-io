import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";

// Use the worker shipped with pdfjs-dist (matches react-pdf's pinned version)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfReaderProps {
  file: string;
  downloadName?: string;
  title?: string;
}

export const PdfReader = ({ file, downloadName, title }: PdfReaderProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const go = (delta: number) =>
    setPageNumber((p) => Math.min(Math.max(1, p + delta), numPages || 1));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums text-muted-foreground">
            Page {pageNumber} {numPages ? `/ ${numPages}` : ""}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!!numPages && pageNumber >= numPages}
            aria-label="Next page"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            aria-label="Zoom out"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs tabular-nums w-10 text-center text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            aria-label="Zoom in"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <a
            href={file}
            download={downloadName}
            className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
      </div>
      <div className="max-h-[80vh] overflow-auto bg-muted/30 flex justify-center p-4">
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="py-20 text-muted-foreground text-sm">Loading {title ?? "PDF"}…</div>}
          error={
            <div className="py-20 text-sm text-muted-foreground">
              Couldn't load the PDF.{" "}
              <a href={file} className="text-primary underline" download={downloadName}>
                Download it instead
              </a>
              .
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};
