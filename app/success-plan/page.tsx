'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import DashboardNavbar from '../components/DashboardNavbar';

export default function SuccessPlan() {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'content-ideas', title: 'Content Ideas', icon: '💡' },
    { id: 'audience-growth', title: 'Audience Growth', icon: '👥' },
    { id: 'engagement', title: 'Engagement', icon: '💬' },
    { id: 'collaboration', title: 'Collaboration', icon: '🤝' },
    { id: 'monetization', title: 'Monetization', icon: '💰' },
    { id: 'sponsorships', title: 'Sponsorships', icon: '📢' },
    { id: 'consistency', title: 'Consistency', icon: '📅' },
    { id: 'mindset', title: 'Creator Mindset', icon: '🧠' }
  ];

  const content = {
    'getting-started': {
      title: "Getting Started: Your Journey Begins Here",
      subtitle: "Remember: Every successful creator started exactly where you are right now",
      content: [
        {
          type: 'motivation',
          text: "🎯 You don't need to be perfect to start. You just need to start. The most successful creators today were once beginners who had no idea what they were doing. What matters is that you're here, ready to learn and grow."
        },
        {
          type: 'step',
          title: "Step 1: Embrace Your Beginner Status",
          text: "Being a beginner is your superpower! You have fresh eyes, genuine curiosity, and the ability to learn from others' mistakes. Don't hide it - embrace it. Your audience will appreciate your authentic journey."
        },
        {
          type: 'step',
          title: "Step 2: Start With What You Have",
          text: "You don't need expensive equipment to begin. Your phone camera is perfect for starting out. Focus on your message and passion - that's what truly matters. Equipment can be upgraded later."
        },
        {
          type: 'tip',
          title: "Pro Tip",
          text: "Create your first piece of content within the next 24 hours. It doesn't have to be perfect - it just has to exist. This builds momentum and confidence."
        }
      ]
    },
    'content-ideas': {
      title: "Content Ideas: Never Run Out of Inspiration",
      subtitle: "Your passion is your greatest content generator",
      content: [
        {
          type: 'motivation',
          text: "💡 You already have more content ideas than you think. Your daily experiences, questions, and learning moments are all potential content. The key is to start noticing them."
        },
        {
          type: 'step',
          title: "The Content Idea Framework",
          text: "1. What problems do you solve in your niche?\n2. What questions do people ask you?\n3. What mistakes have you made that others can learn from?\n4. What are you learning right now?\n5. What makes you excited about your topic?"
        },
        {
          type: 'step',
          title: "Content Types to Try",
          text: "• How-to videos (start with basics)\n• Behind-the-scenes of your learning process\n• Q&A sessions (answer questions you had as a beginner)\n• Day-in-the-life content\n• Review and reaction videos\n• Tutorials for absolute beginners"
        },
        {
          type: 'tip',
          title: "Content Calendar Tip",
          text: "Start with 3 content pieces per week. Quality over quantity. It's better to create 3 amazing pieces than 10 mediocre ones."
        }
      ]
    },
    'audience-growth': {
      title: "Audience Growth: Building Your Community",
      subtitle: "Focus on serving 100 people really well, not 10,000 people poorly",
      content: [
        {
          type: 'motivation',
          text: "👥 Your first 100 followers are the most important. They're your foundation, your cheerleaders, and your feedback loop. Don't chase numbers - chase connection."
        },
        {
          type: 'step',
          title: "The 80/20 Rule of Growth",
          text: "80% of your growth comes from 20% of your content. Focus on creating content that truly serves your audience, not just what gets views. Authentic value always wins."
        },
        {
          type: 'step',
          title: "Platform Strategy",
          text: "Start with one platform and master it. Don't spread yourself thin. Choose the platform where your audience hangs out most. You can expand later when you're comfortable."
        },
        {
          type: 'step',
          title: "Growth Tactics That Work",
          text: "• Consistent posting (even if it's just 2-3 times per week)\n• Engaging with your audience in comments\n• Collaborating with other small creators\n• Using relevant hashtags strategically\n• Cross-promoting on other platforms"
        },
        {
          type: 'tip',
          title: "Remember",
          text: "Slow growth is sustainable growth. Don't compare your chapter 1 to someone else's chapter 20. Focus on your own progress."
        }
      ]
    },
    'engagement': {
      title: "Engagement: Building Real Connections",
      subtitle: "Engagement is a two-way street - give to receive",
      content: [
        {
          type: 'motivation',
          text: "💬 Engagement isn't about numbers - it's about relationships. One meaningful conversation is worth more than 1000 likes. Focus on building real connections."
        },
        {
          type: 'step',
          title: "Respond to Every Comment",
          text: "Especially in the beginning, respond to every comment you receive. This builds loyalty and shows you care about your audience. As you grow, you can be more selective."
        },
        {
          type: 'step',
          title: "Ask Questions in Your Content",
          text: "End your videos/posts with questions that encourage discussion. 'What's your biggest challenge with this topic?' or 'What would you like me to cover next?'"
        },
        {
          type: 'step',
          title: "Create Community Content",
          text: "• Q&A videos based on audience questions\n• Shoutouts to engaged followers\n• Community challenges or contests\n• Live streams to interact in real-time\n• Behind-the-scenes content"
        },
        {
          type: 'tip',
          title: "Engagement Hack",
          text: "Spend 15 minutes each day engaging with other creators in your niche. Comment, like, and share their content. This builds relationships and often leads to collaborations."
        }
      ]
    },
    'collaboration': {
      title: "Collaboration: Growing Together",
      subtitle: "Collaboration is the fastest way to grow and learn",
      content: [
        {
          type: 'motivation',
          text: "🤝 You don't have to do this alone. Some of the best content and fastest growth comes from collaborating with other creators. Plus, it's more fun!"
        },
        {
          type: 'step',
          title: "Finding Collaboration Partners",
          text: "Look for creators who are at a similar level to you or slightly ahead. They're more likely to collaborate because they understand the value of growing together."
        },
        {
          type: 'step',
          title: "Types of Collaborations",
          text: "• Guest appearances on each other's channels\n• Joint live streams or podcasts\n• Collaborative videos or posts\n• Cross-promotion of each other's content\n• Joint challenges or series"
        },
        {
          type: 'step',
          title: "How to Approach Collaborations",
          text: "1. Engage with their content first (genuinely)\n2. Build a relationship over time\n3. Propose a specific collaboration idea\n4. Make it mutually beneficial\n5. Follow through on your commitments"
        },
        {
          type: 'tip',
          title: "Collaboration Tip",
          text: "Start small. A simple shoutout exchange or guest appearance is perfect for beginners. You can work up to bigger projects as you build relationships."
        }
      ]
    },
    'monetization': {
      title: "Monetization: Turning Passion Into Profit",
      subtitle: "Focus on value first, money will follow",
      content: [
        {
          type: 'motivation',
          text: "💰 Don't rush into monetization. Build your audience and provide value first. When you focus on serving others, the money naturally follows. Trust the process."
        },
        {
          type: 'step',
          title: "When to Start Monetizing",
          text: "Start thinking about monetization when you have: 1) A consistent audience of 500+ followers, 2) Regular engagement on your content, 3) Clear value proposition for your audience."
        },
        {
          type: 'step',
          title: "Monetization Methods for Beginners",
          text: "• Affiliate marketing (promote products you actually use)\n• Digital products (guides, templates, courses)\n• Patreon or similar platforms\n• Sponsored content (small brands first)\n• Consulting or coaching services"
        },
        {
          type: 'step',
          title: "Building Trust for Monetization",
          text: "Your audience needs to trust you before they'll buy from you. This takes time and consistent value delivery. Don't push sales - let your audience ask for your products."
        },
        {
          type: 'tip',
          title: "Monetization Mindset",
          text: "Think of monetization as a way to serve your audience better, not just make money. When you create products that truly help people, sales become natural."
        }
      ]
    },
    'sponsorships': {
      title: "Sponsorships: Working With Brands",
      subtitle: "Authentic partnerships that benefit everyone",
      content: [
        {
          type: 'motivation',
          text: "📢 Sponsorships are partnerships, not just transactions. The best brand deals happen when you genuinely love the product and your audience needs it."
        },
        {
          type: 'step',
          title: "When You're Ready for Sponsorships",
          text: "You're ready when you have: 1) Consistent content and posting schedule, 2) Engaged audience (not just followers), 3) Clear niche and audience demographics, 4) Professional communication skills."
        },
        {
          type: 'step',
          title: "Finding Brand Opportunities",
          text: "• Reach out to brands you already use and love\n• Join influencer marketing platforms\n• Network with other creators\n• Create a media kit showcasing your value\n• Start with smaller, local brands"
        },
        {
          type: 'step',
          title: "Pricing Your Sponsorships",
          text: "Start with smaller amounts and increase as you grow. Consider: audience size, engagement rate, content quality, and brand fit. Don't undervalue yourself, but be realistic about your current reach."
        },
        {
          type: 'tip',
          title: "Sponsorship Best Practices",
          text: "Only promote products you genuinely believe in. Your audience trusts you - don't break that trust for a quick buck. Long-term relationships with brands are worth more than one-off deals."
        }
      ]
    },
    'consistency': {
      title: "Consistency: The Secret Weapon",
      subtitle: "Small actions, repeated daily, create massive results",
      content: [
        {
          type: 'motivation',
          text: "📅 Consistency beats perfection every time. It's better to post 3 average videos per week than 1 perfect video per month. Your audience needs to know when to expect you."
        },
        {
          type: 'step',
          title: "Building Consistency Habits",
          text: "1. Start with a realistic schedule (2-3 posts per week)\n2. Batch create content when you're inspired\n3. Use content calendars to plan ahead\n4. Set reminders and alarms\n5. Track your progress"
        },
        {
          type: 'step',
          title: "Overcoming Consistency Challenges",
          text: "• Create content in advance when you're motivated\n• Have backup content ready for busy days\n• Don't let perfect be the enemy of good\n• Remember why you started when motivation is low\n• Celebrate small wins"
        },
        {
          type: 'step',
          title: "The 1% Rule",
          text: "Focus on getting 1% better each day. Small improvements compound over time. Don't try to change everything at once - pick one thing to improve and master it."
        },
        {
          type: 'tip',
          title: "Consistency Hack",
          text: "Create a content bank of 10-15 pieces of content before you start posting regularly. This gives you a safety net and reduces stress."
        }
      ]
    },
    'mindset': {
      title: "Creator Mindset: Your Mental Game",
      subtitle: "Success is 80% mindset, 20% strategy",
      content: [
        {
          type: 'motivation',
          text: "🧠 Your mindset is your most powerful tool. The difference between successful creators and those who give up isn't talent - it's persistence, resilience, and belief in themselves."
        },
        {
          type: 'step',
          title: "Embrace the Learning Process",
          text: "You will make mistakes. You will have videos that flop. You will feel like giving up. This is normal and necessary for growth. Every failure is a lesson in disguise."
        },
        {
          type: 'step',
          title: "Comparison is the Thief of Joy",
          text: "Don't compare your beginning to someone else's middle. Everyone's journey is different. Focus on your own progress and celebrate your wins, no matter how small."
        },
        {
          type: 'step',
          title: "Building Resilience",
          text: "• Learn from criticism but don't let it define you\n• Celebrate small wins and progress\n• Surround yourself with supportive people\n• Take breaks when you need them\n• Remember your 'why' when things get tough"
        },
        {
          type: 'step',
          title: "The Long Game",
          text: "Content creation is a marathon, not a sprint. Success takes time, patience, and persistence. The creators who make it are the ones who don't give up when things get hard."
        },
        {
          type: 'tip',
          title: "Mindset Mantra",
          text: "Repeat this daily: 'I am learning, I am growing, I am becoming the creator I want to be. Every day I get better, and every setback makes me stronger.'"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <DashboardNavbar 
        title="Your Success Plan"
        showBackButton={true}
        showUserInfo={true}
        showSignOut={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Your Complete Creator Success Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Everything you need to know about content creation, from your first video to building a thriving community. 
            Remember: every successful creator started exactly where you are right now.
          </p>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-2xl border border-purple-500/30">
            <p className="text-lg text-purple-200">
              💪 <strong>You've got this!</strong> This guide is designed for creators like you who are ready to start their journey. 
              Take it one step at a time, and don't be afraid to make mistakes along the way.
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {section.icon} {section.title}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
        >
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-white mb-2">
              {content[activeSection as keyof typeof content].title}
            </h3>
            <p className="text-gray-300 text-lg">
              {content[activeSection as keyof typeof content].subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {content[activeSection as keyof typeof content].content.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl ${
                  item.type === 'motivation'
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                    : item.type === 'tip'
                    ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                {item.type === 'motivation' && (
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💪</div>
                    <p className="text-lg text-gray-100 leading-relaxed">{item.text}</p>
                  </div>
                )}
                
                {item.type === 'step' && (
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-3">{item.title}</h4>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{item.text}</p>
                  </div>
                )}
                
                {item.type === 'tip' && (
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-300 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-8 rounded-2xl border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
            <p className="text-lg text-gray-300 mb-6">
              Remember, the only way to fail is to give up. Every creator you admire started with zero followers, 
              zero experience, and zero confidence. What made them successful was their willingness to keep going.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => setActiveSection('getting-started')}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                Start from Beginning
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 