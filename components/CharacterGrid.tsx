"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { ALL_COMPANIONS, CLUSTERS, COMPANIONS } from "@/data/mapping";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function CharacterGrid() {
  return (
    <motion.div
      className="cast-grid"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {ALL_COMPANIONS.map((id) => {
        const c = COMPANIONS[id];
        const cluster = CLUSTERS[c.cluster];
        const style = { "--accent": c.accent } as CSSProperties;
        return (
          <motion.article
            key={id}
            className="cast-card"
            style={style}
            variants={item}
            whileHover={{ y: -6 }}
          >
            <div className="cast-avatar">
              <img src={c.avatar} alt={c.name} />
              <span className="cast-emoji" aria-hidden>{c.emoji}</span>
            </div>
            <h2 className="cast-name">{c.name}</h2>
            <p className="cast-origin">{c.origin}</p>
            <span className="cast-cluster">{cluster.emoji} {cluster.name}</span>
            <p className="cast-tagline">{c.tagline}</p>
            <p className="cast-quote">“{c.quote}”</p>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
