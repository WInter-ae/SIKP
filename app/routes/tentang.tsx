import { ChevronLeft, ChevronRight, Users, Code2, Sparkles } from "lucide-react";

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
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  initials: string;
}

// Constants
const TECHNOLOGIES: Technology[] = [
  { id: 1, name: "React", icon: "⚛️", color: "from-blue-400 to-cyan-400" },
  { id: 2, name: "TypeScript", icon: "📘", color: "from-blue-500 to-blue-600" },
  { id: 3, name: "Tailwind CSS", icon: "🎨", color: "from-teal-400 to-cyan-500" },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "Ahmad Fauzi", role: "Project Lead", initials: "AF" },
  { id: 2, name: "Budi Santoso", role: "Frontend Developer", initials: "BS" },
  { id: 3, name: "Citra Dewi", role: "Backend Developer", initials: "CD" },
  { id: 4, name: "Dian Pratama", role: "UI/UX Designer", initials: "DP" },
  { id: 5, name: "Eka Putri", role: "Quality Assurance", initials: "EP" },
  { id: 6, name: "Fajar Nugroho", role: "DevOps Engineer", initials: "FN" },
];

// Components
interface TechCardProps {
  tech: Technology;
  isDarkMode: boolean;
}

function TechCard({ tech, isDarkMode }: TechCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div
        className={cn(
          "w-24 h-24 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
          `bg-gradient-to-br ${tech.color}`
        )}
      >
        {tech.icon}
      </div>
      <p
        className={cn(
          "text-sm font-medium transition-colors duration-300",
          isDarkMode ? "text-white" : "text-gray-900"
        )}
      >
        {tech.name}
      </p>
    </div>
  );
}

interface TeamMemberCardProps {
  member: TeamMember;
  isDarkMode: boolean;
}

function TeamMemberCard({ member, isDarkMode }: TeamMemberCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0",
        isDarkMode ? "bg-gray-800" : "bg-white shadow-md"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p
              className={cn(
                "font-semibold transition-colors duration-300",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              {member.name}
            </p>
            <p
              className={cn(
                "text-sm transition-colors duration-300",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {member.role}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Tentang() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <Header />

      <section
        className={cn(
          "py-20 min-h-[calc(100vh-300px)] transition-colors duration-300",
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        )}
      >
        <div className="container mx-auto px-4">
          {/* About Header */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card
              className={cn(
                "overflow-hidden border-0",
                isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
              )}
            >
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h1
                      className={cn(
                        "text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      Tentang SIKP
                    </h1>
                    <p
                      className={cn(
                        "text-lg leading-relaxed transition-colors duration-300",
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

          {/* Technology Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Code2 className="h-4 w-4" />
                <span className="text-sm font-medium">Tech Stack</span>
              </div>
              <h2
                className={cn(
                  "text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                Teknologi yang Digunakan
              </h2>
              <p
                className={cn(
                  "text-lg max-w-2xl mx-auto",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Dibangun dengan teknologi modern untuk memberikan pengalaman terbaik
              </p>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isDarkMode ? "border-gray-700 hover:bg-gray-800" : ""
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex gap-12 items-center py-8">
                  {TECHNOLOGIES.map((tech) => (
                    <TechCard key={tech.id} tech={tech} isDarkMode={isDarkMode} />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isDarkMode ? "border-gray-700 hover:bg-gray-800" : ""
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Our Team</span>
              </div>
              <h2
                className={cn(
                  "text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                Tim Pengembang
              </h2>
              <p
                className={cn(
                  "text-lg max-w-2xl mx-auto",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Tim yang berdedikasi untuk mengembangkan platform terbaik bagi mahasiswa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TEAM_MEMBERS.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isDarkMode={isDarkMode}
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
