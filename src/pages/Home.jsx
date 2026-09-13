import React, { useEffect } from 'react';
import PageTransition, { itemVariants } from '../components/PageTransition';
import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import CategoryGrid from '../components/home/CategoryGrid';
import TrendingProducts from '../components/home/TrendingProducts';
import OfferBanner from '../components/home/OfferBanner';
import StatsCounter from '../components/home/StatsCounter';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition className="overflow-hidden">
      <motion.div variants={itemVariants}><Hero /></motion.div>
      <motion.div variants={itemVariants}><CategoryGrid /></motion.div>
      <motion.div variants={itemVariants}><TrendingProducts /></motion.div>
      <motion.div variants={itemVariants}><OfferBanner /></motion.div>
      <motion.div variants={itemVariants}><StatsCounter /></motion.div>
      <motion.div variants={itemVariants}><Testimonials /></motion.div>
      <motion.div variants={itemVariants}><Newsletter /></motion.div>
    </PageTransition>
  );
}
