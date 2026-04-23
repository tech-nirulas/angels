"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FadeInOptions = {
  y?: number;
  x?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  once?: boolean;
};

/** Fade + slide in a single element or a selector of children */
export function useScrollFadeIn(options: FadeInOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const { y = 40, x = 0, duration = 0.9, delay = 0, stagger = 0.12, once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y, x },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [y, x, duration, delay, once]);

  return ref;
}

/** Stagger-animate children of a container */
export function useScrollStagger(
  selector: string,
  options: FadeInOptions = {}
) {
  const ref = useRef<HTMLElement>(null);
  const { y = 30, duration = 0.8, delay = 0, stagger = 0.15, once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(selector),
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [selector, y, duration, delay, stagger, once]);

  return ref;
}

/** Parallax scroll effect */
export function useParallax(speed = 0.4) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -30 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

/** Counter animation */
export function useCounter(end: number, duration = 2) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: end,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (el) el.textContent = Math.round(obj.val).toString();
        },
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [end, duration]);

  return ref;
}