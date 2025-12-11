import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Code2, 
  Sparkles,
  Star,
  Zap,
  Heart,
  Github,
  Linkedin,
  Mail
} from "lucide-react";

import { cn } from "~/lib/utils";
import { useTheme } from "~/contexts/theme-context";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

// Types
interface Technology {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  initials: string;
  gradient: string;
}

// Constants
const TECHNOLOGIES: Technology[] = [
  { id: 1, name: "React", icon: "⚛️", color: "from-blue-400 to-cyan-400", description: "Library UI Modern" },
  { id: 2, name: "TypeScript", icon: "📘", color: "from-blue-500 to-blue-600", description: "Type-Safe JavaScript" },
  { id: 3, name: "Tailwind CSS", icon: "🎨", color: "from-teal-400 to-cyan-500", description: "Utility-First CSS" },
  { id: 4, name: "React Router", icon: "🧭", color: "from-red-400 to-pink-500", description: "File-based Routing" },
  { id: 5, name: "Vite", icon: "⚡", color: "from-purple-400 to-violet-500", description: "Build Tool Cepat" },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "Ahmad Fauzi", role: "Project Lead", initials: "AF", gradient: "from-amber-500 to-orange-600" },
  { id: 2, name: "Budi Santoso", role: "Frontend Developer", initials: "BS", gradient: "from-blue-500 to-cyan-600" },
  { id: 3, name: "Citra Dewi", role: "Backend Developer", initials: "CD", gradient: "from-emerald-500 to-teal-600" },
  { id: 4, name: "Dian Pratama", role: "UI/UX Designer", initials: "DP", gradient: "from-pink-500 to-rose-600" },
  { id: 5, name: "Eka Putri", role: "Quality Assurance", initials: "EP", gradient: "from-purple-500 to-violet-600" },
  { id: 6, name: "Fajar Nugroho", role: "DevOps Engineer", initials: "FN", gradient: "from-red-500 to-orange-600" },
];

const STATS = [
  { icon: Users, value: "1000+", label: "Mahasiswa Terdaftar" },
  { icon: Star, value: "50+", label: "Mitra Perusahaan" },
  { icon: Zap, value: "98%", label: "Tingkat Kepuasan" },
  { icon: Heart, value: "24/7", label: "Support" },
];

// Components
interface TechCardProps {
  tech: Technology;
  isDarkMode: boolean;
  index: number;
}

function TechCard({ tech, isDarkMode, index }: TechCardProps) {
  return (
    <div 
      className="flex flex-col items-center gap-4 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500",
          `bg-gradient-to-br ${tech.color}`
        )} />
        <div
          className={cn(
            "relative w-28 h-28 rounded-3xl flex items-center justify-center text-5xl transition-all duration-500",
            "group-hover:scale-110 group-hover:-rotate-6",
            `bg-gradient-to-br ${tech.color}`,
            "shadow-lg group-hover:shadow-2xl"
          )}
        >
          <span className="animate-bounce-subtle">{tech.icon}</span>
        </div>
      </div>
      <div className="text-center">
        <p
          className={cn(
            "font-bold text-lg transition-colors duration-300",
            isDarkMode ? "text-white" : "text-gray-900"
          )}
        >
          {tech.name}
        </p>
        <p
          className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}
        >
          {tech.description}
        </p>
      </div>
    </div>
  );
}

interface TeamMemberCardProps {
  member: TeamMember;
  isDarkMode: boolean;
  index: number;
}

function TeamMemberCard({ member, isDarkMode, index }: TeamMemberCardProps) {
  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500",
        `bg-gradient-to-br ${member.gradient}`
      )} />
      
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-500 border-0 rounded-3xl",
          "hover:scale-[1.02] hover:-translate-y-2",
          isDarkMode 
            ? "bg-gray-800/80 backdrop-blur-xl" 
            : "bg-white/80 backdrop-blur-xl shadow-xl"
        )}
      >
        {/* Gradient accent */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          `bg-gradient-to-r ${member.gradient}`
        )} />
        
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Avatar with glow */}
            <div className="relative mb-5">
              <div className={cn(
                "absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500",
                `bg-gradient-to-br ${member.gradient}`
              )} />
              <Avatar className="relative h-20 w-20 ring-4 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                <AvatarFallback className={cn(
                  "text-xl font-bold text-white",
                  `bg-gradient-to-br ${member.gradient}`
                )}>
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <h3
              className={cn(
                "font-bold text-xl mb-1 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              {member.name}
            </h3>
            <p
              className={cn(
                "text-sm font-medium mb-4",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              {member.role}
            </p>
            
            {/* Social icons */}
            <div className="flex gap-3">
              {[Github, Linkedin, Mail].map((Icon, i) => (
                <button 
                  key={i}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    "hover:scale-110",
                    isDarkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Tentang() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <Header />

      <section
        className={cn(
          "py-24 min-h-[calc(100vh-300px)] transition-colors duration-300 relative overflow-hidden",
          isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        )}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl",
            isDarkMode ? "bg-primary/5" : "bg-primary/10"
          )} />
          <div className={cn(
            "absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl",
            isDarkMode ? "bg-secondary/5" : "bg-secondary/10"
          )} />
          
          {/* Floating sparkles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-10"
              style={{
                left: `${5 + i * 12}%`,
                top: `${10 + (i % 4) * 25}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.4}s`
              }}
            >
              <Star className={cn(
                "h-6 w-6",
                isDarkMode ? "text-primary" : "text-primary"
              )} />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* About Header */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="group relative">
              {/* Glow effect */}
              <div className={cn(
                "absolute -inset-2 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500",
                "bg-gradient-to-r from-primary via-secondary to-primary"
              )} />
              
              <Card
                className={cn(
                  "relative overflow-hidden border-0 rounded-[2rem]",
                  isDarkMode 
                    ? "bg-gray-800/80 backdrop-blur-xl" 
                    : "bg-white/80 backdrop-blur-xl shadow-2xl"
                )}
              >
                <CardContent className="p-10 md:p-16">
                  <div className="flex flex-col lg:flex-row items-center gap-10">
                    {/* Icon with animation */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 animate-pulse">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary blur-xl opacity-50" />
                      </div>
                      <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                        <Sparkles className="h-16 w-16 text-white animate-pulse" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                        isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                      )}>
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-semibold tracking-wide">Tentang Kami</span>
                      </div>
                      
                      <h1
                        className={cn(
                          "text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}
                      >
                        Portal <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SIKP</span>
                      </h1>
                      <p
                        className={cn(
                          "text-xl leading-relaxed transition-colors duration-300",
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        )}
                      >
                        Portal Kerja Praktik adalah aplikasi yang dirancang untuk
                        mempermudah mahasiswa dalam mencari, mendaftar, dan
                        melaksanakan program kerja praktik. Dengan sistem yang
                        terintegrasi, proses administrasi menjadi lebih efisien dan
                        transparan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-24">
            {STATS.map((stat, index) => (
              <div 
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                  "bg-gradient-to-r from-primary to-secondary"
                )} />
                <div className={cn(
                  "relative text-center py-8 px-6 rounded-2xl transition-all duration-300 group-hover:scale-105",
                  isDarkMode 
                    ? "bg-gray-800/80 backdrop-blur-xl" 
                    : "bg-white/80 backdrop-blur-xl shadow-lg"
                )}>
                  <div className={cn(
                    "w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-secondary"
                  )}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <p className={cn(
                    "text-3xl font-black mb-1",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {stat.value}
                  </p>
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Technology Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
              )}>
                <Code2 className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">Tech Stack</span>
              </div>
              <h2
                className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-black mb-6 tracking-tight",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                Teknologi <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Modern</span>
              </h2>
              <p
                className={cn(
                  "text-xl max-w-2xl mx-auto",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Dibangun dengan teknologi terkini untuk pengalaman terbaik
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* Glassmorphism container */}
              <div className={cn(
                "relative rounded-3xl p-10",
                isDarkMode 
                  ? "bg-gray-800/50 backdrop-blur-xl" 
                  : "bg-white/50 backdrop-blur-xl shadow-xl"
              )}>
                <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
                  {TECHNOLOGIES.map((tech, index) => (
                    <TechCard 
                      key={tech.id} 
                      tech={tech} 
                      isDarkMode={isDarkMode}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div>
            <div className="text-center mb-16">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
              )}>
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">Our Team</span>
              </div>
              <h2
                className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-black mb-6 tracking-tight",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                Tim <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Pengembang</span>
              </h2>
              <p
                className={cn(
                  "text-xl max-w-2xl mx-auto",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Tim yang berdedikasi untuk mengembangkan platform terbaik bagi mahasiswa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {TEAM_MEMBERS.map((member, index) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isDarkMode={isDarkMode}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Tentang;
