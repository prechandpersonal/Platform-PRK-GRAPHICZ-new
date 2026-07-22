import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Palette, Share2, Zap, Rocket, Monitor, Image as ImageIcon, Layers, PenTool, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const allServices = [
    {
      title: 'Brand Strategy',
      description: 'Strategic branding solutions to elevate your business identity and market position.',
      icon: <Zap size={32} />,
      color: 'bg-brand-primary text-brand-secondary',
    },
    {
      title: 'Digital Marketing',
      description: 'Results-driven marketing campaigns to attract customers and drive growth.',
      icon: <Share2 size={32} />,
      color: 'bg-brand-primary text-brand-secondary',
    },
    {
      title: 'Professional Design',
      description: 'Premium design solutions that build credibility and trust with your audience.',
      icon: <Palette size={32} />,
      color: 'bg-brand-primary text-brand-secondary',
    },
  ];

  const projects = [
    {
      id: 1,
      title: 'Aura Skincare',
      category: 'Brand Identity & Packaging',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=2940&auto=format&fit=crop',
      size: 'large'
    },
    {
      id: 2,
      title: 'Fintech Dashboard UI',
      category: 'Web Design & UI/UX',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop',
      size: 'small'
    },
    {
      id: 3,
      title: 'Nordic Roast Coffee',
      category: 'Brand Identity',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2942&auto=format&fit=crop',
      size: 'medium'
    },
    {
      id: 4,
      title: 'Urban Architecture',
      category: 'Editorial Design',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2940&auto=format&fit=crop',
      size: 'small'
    },
    {
      id: 5,
      title: 'Flow App',
      category: 'Mobile App Design',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop',
      size: 'medium'
    },
    {
      id: 6,
      title: 'Lumina Digital',
      category: 'Creative Direction',
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2940&auto=format&fit=crop',
      size: 'large'
    }
  ];

  return (
    <Layout>
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-brand-primary"
            >
              Our Solutions & <span className="text-brand-secondary font-display uppercase tracking-tighter">Work</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-black/80 max-w-2xl mx-auto"
            >
              Comprehensive business solutions tailored for Small and Medium Enterprises (SMEs). We handle the creative strategy, so you can focus on growth.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {allServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-8 rounded-3xl bg-white border border-black/5 hover:border-black/10 hover:shadow-xl hover:shadow-black/5 transition-all group"
              >
                <div className={`mb-8 p-4 ${service.color} rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-black/70 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 px-6 bg-[#fcfcfc]" id="portfolio">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">Concept Portfolio</h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              A curated collection of concept projects showcasing our strategic approach to branding, digital design, and visual storytelling.
            </p>
          </div>

          {/* Masonry/Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative group rounded-3xl overflow-hidden cursor-pointer
                  ${project.size === 'large' ? 'md:col-span-2 lg:col-span-2 row-span-2' : ''}
                  ${project.size === 'medium' ? 'md:col-span-1 lg:col-span-1 row-span-2' : ''}
                  ${project.size === 'small' ? 'md:col-span-1 lg:col-span-1 row-span-1' : ''}
                `}
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-brand-secondary text-sm font-bold tracking-widest uppercase mb-2">
                        {project.category}
                      </p>
                      <h3 className="text-2xl font-bold text-white">
                        {project.title}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
                      <ArrowUpRight size={24} className="text-brand-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">We help</h2>
              <p className="text-xl text-white/90 mb-12">
                Our streamlined process ensures you get high-quality business solutions without the headache of managing freelancers.
              </p>
              <div className="space-y-12 relative">
                {/* Connecting Line */}
                <div className="absolute left-[11px] top-8 bottom-8 w-[2px] bg-white/20" />
                
                {[
                  { 
                    step: '01', 
                    title: 'Step 1: Choose Your Plan', 
                    desc: 'Select the strategic plan that fits your business goals.',
                    note: 'Note: We require a 3-month minimum commitment for long-term growth. Your first month is paid upfront, with subsequent billing occurring on the 26th of each month.'
                  },
                  { 
                    step: '02', 
                    title: 'Step 2: Brand Integration & Strategy', 
                    desc: 'Upload your business assets and tell us your objectives. Simply select the specific services from your chosen plan that you’d like us to prioritize for your growth.' 
                  },
                  { 
                    step: '03', 
                    title: 'Step 3: Execution & Review', 
                    desc: 'Your custom solutions will be delivered based on your personalized strategy. You can track progress, download assets, and manage your campaigns directly through your Client Dashboard.' 
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-8 relative z-10">
                    <div className="relative flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-white border-4 border-brand-primary z-10 relative mt-1" />
                      <span className="absolute -left-12 top-0 text-2xl font-bold text-white/40 font-mono">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-3 text-white">{item.title}</h4>
                      <p className="text-white/80 leading-relaxed mb-2">{item.desc}</p>
                      {item.note && (
                        <p className="text-white/60 text-sm italic">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="w-64 h-64 bg-white/10 blur-[100px] absolute" />
                <div className="relative z-10 text-center p-12 text-white">
                  <h3 className="text-3xl font-bold mb-6 font-display leading-tight">"Growth is never by mere chance; it is the result of forces working together."</h3>
                  <p className="text-white/60 font-medium">— James Cash Penney</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
