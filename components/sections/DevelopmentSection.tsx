'use client';

import { motion } from 'framer-motion';
import { Calendar, ExternalLink, FileText } from 'lucide-react';
import { ReadmeData } from '@/types';
import GlassCard from '../GlassCard';

interface DevelopmentSectionProps {
  data: ReadmeData['development'];
}

function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

export default function DevelopmentSection({ data }: DevelopmentSectionProps) {
  const projects = data.projects || [];

  return (
    <section id="development" className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-7xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center"
        >
          开发
        </motion.h2>

        {/* 技能 */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="font-semibold mb-4">技术栈</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.tech_stack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-500/20 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="font-semibold mb-4">专长</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-500/20 rounded-full text-sm"
                >
                  {exp}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* 项目 - 双列左右卡片布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="h-full"
            >
              <GlassCard className="h-full !p-0 overflow-hidden flex flex-col sm:flex-row border border-white/20 hover:border-white/40 transition-colors">
                {/* 左块：视觉与元信息 */}
                <div className="sm:w-2/5 p-5 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/10 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-col justify-between shrink-0 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 text-blue-400 font-bold text-lg shadow-inner">
                      {project.project_name ? project.project_name.substring(0, 1).toUpperCase() : 'P'}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400 space-y-1">
                      {project.start_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400/80 shrink-0" />
                          <span>{project.start_date} {project.end_date ? `~ ${project.end_date}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 角色标签 */}
                  {project.role && project.role.length > 0 && (
                    <div className="relative z-10 mt-4 flex flex-wrap gap-1">
                      {project.role.map((r, rIdx) => (
                        <span key={rIdx} className="px-1.5 py-0.5 bg-blue-500/15 text-blue-300 text-[10px] rounded border border-blue-500/20">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 右块：详细内容 */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {project.project_name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* 技术栈 */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tech_stack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white/10 dark:bg-white/5 border border-white/10 text-gray-700 dark:text-gray-300 text-[11px] rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 链接 */}
                    <div className="flex items-center gap-4 text-xs pt-3 border-t border-white/10">
                      {project.github && project.github.trim() !== '' && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {project.link && project.link.trim() !== '' && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>访问</span>
                        </a>
                      )}
                      {project.report_link && project.report_link.trim() !== '' && (
                        <a
                          href={project.report_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>报告</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* 开发工具 */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6">开发工具</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.dev_tools.map((tool, idx) => (
              <GlassCard key={idx}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{tool.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {tool.comment}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white/10 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {tool.link && (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-blue-400 hover:underline"
                    >
                      访问 →
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
