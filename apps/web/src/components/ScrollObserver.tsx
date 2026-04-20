"use client";

import { useEffect } from "react";

export default function ScrollObserver() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll, .service-card, .section-title").forEach((el) => {
      el.classList.add("animate-on-scroll");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
