import React from 'react';
import aboutImg from '../assets/about.png';
import PageTransition, { itemVariants } from '../components/PageTransition';
import { motion } from 'framer-motion';

// Fade + slide-up reveal, used for every scroll-triggered element on this page
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay },
  }),
};

const About = () => {
  return (
    <PageTransition className="bg-primary-50 min-h-screen flex flex-col font-sans text-neutral-900">

      {/* Main Content */}
      <main className="flex-grow">
        {/* Our Philosophy Section */}
        <motion.section variants={itemVariants} className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeUp}
                className="lg:pr-10 px-6 flex flex-col justify-center h-full"
              >
                <h1 className="text-4xl md:text-[2.75rem] font-serif font-bold mb-6 text-[#1a1a1a] leading-tight">
                  Our Philosophy
                </h1>
                <p className="text-base md:text-[1.05rem] text-[#1a1a1a] font-normal mb-6 leading-relaxed">
                  We believe that your home should be more than just a place to live—it should be a curated extension of your identity.
                </p>
                <p className="text-sm md:text-[0.95rem] text-neutral-600 mb-10 leading-relaxed">
                  Founded in 2024, Living Space Hub started as a small boutique with a singular goal: to bring artisanal, high-quality home decor to design lovers around the world. We partner with independent designers and established craftsmen to source pieces that are as sustainable as they are beautiful.
                </p>

                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="pr-2 md:pr-4">
                    <h4 className="text-lg md:text-xl font-serif font-bold text-[#1a1a1a] mb-3">Artisanal</h4>
                    <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
                      Each piece is hand-selected for its unique character and craftsmanship.
                    </p>
                  </div>
                  <div className="pr-2 md:pr-4">
                    <h4 className="text-lg md:text-xl font-serif font-bold text-[#1a1a1a] mb-3">Sustainable</h4>
                    <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
                      We prioritize ethically sourced materials and responsible production.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeUp}
                custom={0.15}
                className="mt-4 lg:mt-0"
              >
                <img
                  src={aboutImg}
                  className="w-full h-auto rounded-2xl shadow-xl object-cover max-h-[700px]"
                  alt="Living Space Hub - Our Philosophy"
                />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Our Journey Section */}
        <motion.section variants={itemVariants} className="py-12 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeUp}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-950">
                Our Journey
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeUp}
                custom={0}
              >
                <div className="p-6 border-l-4 border-[#0d6efd] bg-neutral-50 h-full shadow-sm rounded-r-lg">
                  <h5 className="text-base font-bold text-primary-950 mb-2">2024</h5>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Launched as a digital gallery in London, showcasing local ceramic artists.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeUp}
                custom={0.15}
              >
                <div className="p-6 border-l-4 border-[#0d6efd] bg-neutral-50 h-full shadow-sm rounded-r-lg">
                  <h5 className="text-base font-bold text-primary-950 mb-2">2025</h5>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Expanded our collection to include premium furniture and sustainable textiles.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeUp}
                custom={0.3}
              >
                <div className="p-6 border-l-4 border-[#0d6efd] bg-neutral-50 h-full shadow-sm rounded-r-lg">
                  <h5 className="text-base font-bold text-primary-950 mb-2">2026</h5>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Now serving design enthusiasts globally with shipping to over 50 countries.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

    </PageTransition>
  );
};

export default About;