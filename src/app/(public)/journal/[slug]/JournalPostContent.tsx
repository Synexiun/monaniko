"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { journalPosts } from "@/data/artworks";

export default function JournalPostContent() {
  const params = useParams();
  const post = journalPosts.find((p) => p.slug === params.slug);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!post) {
    return (
      <section className="py-32 md:py-40">
        <div className="container-gallery text-center">
          <h1 className="font-serif text-3xl text-black mb-4">
            Post Not Found
          </h1>
          <p className="text-charcoal-light mb-8">
            The journal post you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Link href="/journal">
            <Button variant="outline">Back to Journal</Button>
          </Link>
        </div>
      </section>
    );
  }

  const relatedPosts = journalPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <>
      {/* ─── Cover Image ──────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/50 hover:text-gold transition-colors mb-8"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Journal
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="inline-block bg-gold/20 text-gold text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 mb-6">
              {post.category}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl text-white font-light tracking-[-0.02em] max-w-4xl mx-auto leading-[1.15]"
          >
            {post.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-4 text-white/50"
          >
            <span className="text-sm">{post.author}</span>
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span className="text-sm">
              {post.publishedAt &&
                new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── Article Body ─────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            {/* Lead Image */}
            <div className="relative aspect-[16/9] overflow-hidden mb-12">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose-gallery space-y-6 text-[15px] text-charcoal-light leading-[1.9]">
              <p className="text-lg text-charcoal leading-[1.8] first-letter:text-5xl first-letter:font-serif first-letter:text-gold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                {post.excerpt}
              </p>

              <p>
                The creative process is never linear. It winds through moments
                of clarity and doubt, through bursts of inspiration and
                stretches of quiet contemplation. What keeps me returning to
                the canvas each day is the promise of discovery — that
                somewhere between the first brushstroke and the last, something
                truthful will emerge.
              </p>

              <p>
                For this particular body of work, I found myself drawn to the
                interplay between light and shadow, between what is revealed
                and what remains hidden. The paintings began as responses to
                specific moments — the way morning light fell across my studio
                floor, the color of the sky just before dusk, the texture of
                an ancient wall in a village I visited last summer.
              </p>

              <blockquote className="border-l-2 border-gold pl-6 py-2 my-10">
                <p className="font-serif text-xl text-black italic leading-relaxed">
                  &ldquo;Every painting is a conversation between intention and
                  surrender. The magic happens in the space between what you
                  plan and what you allow.&rdquo;
                </p>
                <cite className="text-sm text-charcoal-light mt-3 block not-italic">
                  — Mona Niko
                </cite>
              </blockquote>

              <p>
                Working with oils allows me a patience that other media do not.
                The slow drying time becomes an invitation to sit with the work,
                to let it speak before I respond. Layer by layer, the painting
                builds its own logic, its own internal rhythm. My role shifts
                from creator to listener, from director to collaborator.
              </p>

              <p>
                The resulting pieces carry within them the time and attention
                that went into their creation. They are not rushed, not
                formulaic. Each one is a unique record of a creative journey — a
                journey I invite you to share.
              </p>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-warm-gray">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light mr-2">
                  Tags:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] tracking-[0.1em] uppercase bg-cream-dark text-charcoal-light px-3 py-1.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* ─── Newsletter Signup ────────────────────────────── */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container-gallery max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
              Stay Connected
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-4">
              Subscribe to the Journal
            </h2>
            <div className="divider-gold mx-auto mb-8" />
            <p className="text-white/60 leading-relaxed mb-10">
              Receive new journal entries, studio updates, and exclusive
              previews directly in your inbox. No spam — just art.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 p-8"
              >
                <div className="text-gold mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="mx-auto"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="text-white font-serif text-lg">
                  Welcome to the Journal
                </p>
                <p className="text-white/50 text-sm mt-2">
                  You will receive your first update soon.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                  placeholder="your@email.com"
                />
                <Button type="submit" variant="gold">
                  Subscribe
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Related Posts ────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-gallery">
            <SectionHeading
              title="Continue Reading"
              subtitle="More from the journal."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {relatedPosts.map((relatedPost, i) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={`/journal/${relatedPost.slug}`}
                    className="group block bg-white hover:shadow-lg transition-shadow duration-500"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block bg-white/90 backdrop-blur-sm text-[10px] tracking-[0.15em] uppercase text-charcoal px-3 py-1.5">
                          {relatedPost.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <h3 className="font-serif text-lg text-black group-hover:text-gold transition-colors mb-3 leading-snug">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-charcoal-light leading-relaxed">
                        {relatedPost.excerpt}
                      </p>
                      <p className="text-[11px] text-charcoal-light mt-4">
                        {relatedPost.publishedAt &&
                          new Date(relatedPost.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
