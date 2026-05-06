import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ScrollImageSequence } from "./ScrollImageSequence";
import styles from "./ScrollStorySequence.module.css";

const smoothstep = (t) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

function easedOpacity(progress, start, end, fade = 0.15) {
  if (progress < start || progress > end) return 0;
  const span = Math.max(end - start, 0.0001);
  const fadeAmount = Math.min(fade, span * 0.5);
  if (progress < start + fadeAmount) return smoothstep((progress - start) / fadeAmount);
  if (progress > end - fadeAmount) return smoothstep((end - progress) / fadeAmount);
  return 1;
}

function stepOpacity(progress, start, end) {
  return progress >= start && progress <= end ? 1 : 0;
}

function CardCTA({ ctaLabel, ctaHref }) {
  if (!ctaLabel || !ctaHref) return null;
  const isInternal = ctaHref.startsWith("/");
  if (isInternal) {
    return (
      <Link to={ctaHref} className={styles.cta}>
        {ctaLabel}
      </Link>
    );
  }
  return (
    <a href={ctaHref} className={styles.cta} target="_blank" rel="noopener noreferrer">
      {ctaLabel}
    </a>
  );
}

export function ScrollStorySequence(props) {
  const { overlayCards = [], showVignette = true, ...sequenceProps } = props;

  const onProgressRef = useRef(() => {});
  const cardElsRef = useRef([]);
  const vignetteRef = useRef(null);
  const frameElRef = useRef(null);
  const scrollCueRef = useRef(null);

  const cards = overlayCards;

  // Reset element list whenever the cards array identity changes so stale
  // refs from a previous render don't get written to.
  useLayoutEffect(() => {
    cardElsRef.current = cardElsRef.current.slice(0, cards.length);
  }, [cards.length]);

  useLayoutEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const opacityFor = reduceMotion ? stepOpacity : easedOpacity;

    onProgressRef.current = (progress) => {
      let maxOpacity = 0;
      for (let i = 0; i < cards.length; i += 1) {
        const card = cards[i];
        const el = cardElsRef.current[i];
        if (!el) continue;
        const o = opacityFor(progress, card.start, card.end, card.fade);
        if (o > maxOpacity) maxOpacity = o;
        el.style.opacity = String(o);
        el.style.visibility = o > 0.01 ? "visible" : "hidden";
      }
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String(maxOpacity * 0.6);
      }
      // Drive the underlying Ahri frame's blur+dim from the strongest
      // visible card. Hold-frame moments have maxOpacity=0 so the frame
      // shows clean; mid-card moments hit blur 24px and brightness 0.7.
      if (frameElRef.current) {
        const blurPx = maxOpacity * 24;
        const brightness = 1 - maxOpacity * 0.3;
        frameElRef.current.style.filter = `blur(${blurPx}px) brightness(${brightness})`;
      }
      // Scroll cue: fully visible at the very top, fades out as the user
      // begins scrolling so it never overlaps the first card fade-in.
      if (scrollCueRef.current) {
        const cueOpacity =
          progress < 0.015 ? 1 : progress > 0.045 ? 0 : 1 - (progress - 0.015) / 0.03;
        scrollCueRef.current.style.opacity = String(cueOpacity);
        scrollCueRef.current.style.visibility = cueOpacity > 0.01 ? "visible" : "hidden";
      }
    };
  }, [cards]);

  // Initial paint: with no scroll yet, run the function once at progress 0
  // so cards aren't briefly visible before the first rAF tick.
  useEffect(() => {
    onProgressRef.current?.(0);
  }, []);

  return (
    <ScrollImageSequence
      {...sequenceProps}
      hideDefaultCopy
      onProgressRef={onProgressRef}
      frameElRef={frameElRef}
    >
      <div className={styles.overlayLayer} aria-hidden={false}>
        {showVignette && (
          <div ref={vignetteRef} className={styles.vignette} aria-hidden="true" />
        )}
        <button
          ref={scrollCueRef}
          type="button"
          className={styles.scrollCue}
          onClick={() => {
            const reduce =
              typeof window !== "undefined" &&
              window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({
              top: window.scrollY + window.innerHeight,
              behavior: reduce ? "auto" : "smooth",
            });
          }}
          aria-label="Scroll to explore"
        >
          <span className={styles.scrollCueLabel}>Explore</span>
          <svg
            className={styles.scrollCueChevron}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {cards.map((card, i) => {
          const variantClass = card.variant ? styles[card.variant] : "";
          return (
            <article
              key={card.id}
              ref={(el) => {
                cardElsRef.current[i] = el;
              }}
              className={`${styles.card} ${styles.center} ${variantClass}`}
            >
              {card.icon && (
                <div className={styles.cardIcon} aria-hidden="true">
                  {card.icon}
                </div>
              )}
              {card.eyebrow && <p className={styles.eyebrow}>{card.eyebrow}</p>}
              {card.title && <h2 className={styles.title}>{card.title}</h2>}
              {card.subtitle && <p className={styles.subtitle}>{card.subtitle}</p>}
              {card.body && <p className={styles.body}>{card.body}</p>}
              {card.chips?.length > 0 && (
                <div className={styles.chips}>
                  {card.chips.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              )}
              {card.techGrid?.length > 0 && (
                <div className={styles.techGrid}>
                  {card.techGrid.map(({ label, value }) => (
                    <div key={label}>
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              )}
              {card.bullets?.length > 0 && (
                <ul className={styles.bullets}>
                  {card.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              <CardCTA ctaLabel={card.ctaLabel} ctaHref={card.ctaHref} />
            </article>
          );
        })}
      </div>
    </ScrollImageSequence>
  );
}
