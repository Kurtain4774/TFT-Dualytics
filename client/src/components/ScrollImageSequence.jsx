import { useCallback, useEffect, useRef } from "react";
import styles from "../pages/AboutPage.module.css";

const DEFAULT_LINEAR_SEGMENT = [{ type: "play", from: 1, to: 273, start: 0, end: 1 }];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function buildFrameFilename(frameNumber, filePrefix, fileExtension, padLength) {
  const paddedFrame = String(frameNumber).padStart(padLength, "0");
  return `${filePrefix}${paddedFrame}.${fileExtension}`;
}

function buildFrameSrc(params) {
  const { frameNumber, framePath, filePrefix, fileExtension, padLength, frameSources } = params;
  const filename = buildFrameFilename(frameNumber, filePrefix, fileExtension, padLength);

  if (frameSources?.[filename]) return frameSources[filename];

  const normalizedPath = framePath.replace(/\/$/, "");
  return `${normalizedPath}/${filename}`;
}

function getFrameFromTimeline(progress, timelineSegments, frameCount) {
  const safeProgress = clamp(progress, 0, 1);
  const fallback = DEFAULT_LINEAR_SEGMENT.map((segment) => ({ ...segment, to: frameCount }));
  const segments = timelineSegments?.length ? timelineSegments : fallback;
  const segment = segments.find(({ start, end }) => safeProgress >= start && safeProgress <= end) || segments.at(-1);

  if (!segment) return 1;
  if (segment.type === "hold") return clamp(segment.frame, 1, frameCount);

  const distance = Math.max(segment.end - segment.start, 0.0001);
  const localProgress = clamp((safeProgress - segment.start) / distance, 0, 1);
  const frame = Math.floor(segment.from + localProgress * (segment.to - segment.from));
  return clamp(frame, 1, frameCount);
}

export function ScrollImageSequence(props) {
  const {
    frameCount,
    framePath,
    filePrefix,
    fileExtension,
    padLength,
    scrollHeight,
    frameSources,
    timelineSegments,
    maxRenderWidth = 1280,
    maxRenderHeight = 720,
    allowUpscale = false,
    useBlurredBackdrop = true,
    hideDefaultCopy = false,
    onProgressRef,
    frameElRef,
    children,
  } = props;
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  // Expose the underlying frame <img> to parents that want to drive its
  // CSS filter (blur/dim) on every progress tick — see ScrollStorySequence.
  useEffect(() => {
    if (frameElRef) frameElRef.current = imageRef.current;
    return () => {
      if (frameElRef) frameElRef.current = null;
    };
  }, [frameElRef]);
  const backdropRef = useRef(null);
  const frameCacheRef = useRef([]);
  const currentFrameRef = useRef(1);
  const getFrameSrc = useCallback(
    (frameNumber) =>
      buildFrameSrc({ frameNumber, framePath, filePrefix, fileExtension, padLength, frameSources }),
    [framePath, filePrefix, fileExtension, padLength, frameSources],
  );
  const firstFrameSrc = getFrameSrc(1);

  useEffect(() => {
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    frameCacheRef.current = new Array(frameCount);

    const preloadFrame = (frameNumber) => {
      const image = new Image();
      image.decoding = "async";
      image.src = getFrameSrc(frameNumber);
      frameCacheRef.current[frameNumber - 1] = image;
    };

    preloadFrame(1);

    let nextFrameNumber = 2;
    const preloadNextFrame = () => {
      if (cancelled || nextFrameNumber > frameCount) return;
      preloadFrame(nextFrameNumber);
      nextFrameNumber += 1;

      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(preloadNextFrame, { timeout: 120 });
      } else {
        timeoutId = window.setTimeout(preloadNextFrame, 16);
      }
    };

    preloadNextFrame();

    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [frameCount, getFrameSrc]);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return undefined;

    let rafId = 0;

    const updateFrame = () => {
      rafId = 0;

      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = Math.max(sectionHeight - viewportHeight, 1);
      const progress = clamp(
        (window.scrollY - sectionTop) / scrollableDistance,
        0,
        1,
      );

      // Notify subscribers (overlay layer) of every progress tick, even when
      // the frame number has not changed — overlays may need to ease opacity
      // through hold segments.
      if (onProgressRef?.current) onProgressRef.current(progress);

      const frameNumber = getFrameFromTimeline(progress, timelineSegments, frameCount);

      if (frameNumber === currentFrameRef.current) return;

      currentFrameRef.current = frameNumber;
      const cachedFrame = frameCacheRef.current[frameNumber - 1];
      const frameSrc = cachedFrame?.src || getFrameSrc(frameNumber);
      image.src = frameSrc;
      if (backdropRef.current) backdropRef.current.src = frameSrc;
    };

    const scheduleFrameUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateFrame);
    };

    scheduleFrameUpdate();
    window.addEventListener("scroll", scheduleFrameUpdate, { passive: true });
    window.addEventListener("resize", scheduleFrameUpdate);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleFrameUpdate);
      window.removeEventListener("resize", scheduleFrameUpdate);
    };
  }, [frameCount, getFrameSrc, timelineSegments, onProgressRef]);

  return (
    <section
      ref={sectionRef}
      className={styles.sequenceSection}
      style={{
        "--sequence-scroll-height": scrollHeight,
        "--sequence-max-width": maxRenderWidth ? `${maxRenderWidth}px` : "100vw",
        "--sequence-max-height": maxRenderHeight ? `${maxRenderHeight}px` : "100vh",
      }}
      aria-label="Ahri animation sequence"
    >
      <div className={styles.sequenceViewport}>
        {useBlurredBackdrop && (
          <img
            ref={backdropRef}
            className={styles.sequenceBackdrop}
            src={firstFrameSrc}
            alt=""
            aria-hidden="true"
          />
        )}
        <img
          ref={imageRef}
          className={`${styles.sequenceFrame} ${
            allowUpscale ? styles.sequenceFrameCover : styles.sequenceFrameNative
          }`}
          src={firstFrameSrc}
          alt=""
          aria-hidden="true"
        />
        {!hideDefaultCopy && (
          <div className={styles.sequenceCopy}>
            <p className={styles.eyebrow}>Scroll Sequence</p>
            <h1>Double Up Intelligence In Motion</h1>
            <p>Scroll to scrub the full nine-second frame sequence forward and reverse.</p>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
