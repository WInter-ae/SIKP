import { useState } from "react";
import { Link } from "react-router";
import { 
  Search, 
  Building2, 
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Star
} from "lucide-react";

import { cn } from "~/lib/utils";
import { useTheme } from "~/contexts/theme-context";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// Types
interface ReferensiItem {
  id: number;
  name: string;
  category?: string;
  studentCount?: number;
}

// Constants
const REFERENSI_DATA: ReferensiItem[] = [
  { id: 1, name: "PT. Cinta Sejati", category: "Teknologi", studentCount: 15 },
  { id: 2, name: "Kominfo", category: "Pemerintahan", studentCount: 25 },
  { id: 3, name: "Kominfo Sumsel", category: "Pemerintahan", studentCount: 12 },
  { id: 4, name: "PT. Cinta Sejati", category: "Teknologi", studentCount: 8 },
  { id: 5, name: "Telkom Indonesia", category: "Telekomunikasi", studentCount: 30 },
  { id: 6, name: "Bank Sumsel Babel", category: "Perbankan", studentCount: 20 },
];

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  "Teknologi": "from-blue-500 to-cyan-500",
  "Pemerintahan": "from-emerald-500 to-teal-500",
  "Telekomunikasi": "from-purple-500 to-pink-500",
  "Perbankan": "from-amber-500 to-orange-500",
};

// Components
interface ReferensiCardProps {
  item: ReferensiItem;
  isDarkMode: boolean;
  index: number;
}

function ReferensiCard({ item, isDarkMode, index }: ReferensiCardProps) {
  const gradientColor = CATEGORY_COLORS[item.category || ""] || "from-gray-500 to-gray-600";
  
  return (
    <Link 
      to={`/detail-referensi/${item.id}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="group relative h-full">
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500",
          `bg-gradient-to-r ${gradientColor}`
        )} />
        
        <Card
          className={cn(
            "relative h-full overflow-hidden border-0 rounded-2xl transition-all duration-500",
            "hover:scale-[1.02] hover:-translate-y-1",
            isDarkMode 
              ? "bg-gray-800/80 backdrop-blur-xl shadow-lg shadow-black/20" 
              : "bg-white/80 backdrop-blur-xl shadow-xl shadow-gray-200/50"
          )}
        >
          {/* Gradient accent line */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            `bg-gradient-to-r ${gradientColor}`
          )} />
          
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              {/* Logo with gradient */}
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500",
                  `bg-gradient-to-br ${gradientColor}`
                )} />
                <div
                  className={cn(
                    "relative w-20 h-20 flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110",
                    `bg-gradient-to-br ${gradientColor}`
                  )}
                >
                  <Building2 className="h-9 w-9 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-xl font-bold mb-2 truncate transition-colors duration-300",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  {item.name}
                </h3>
                
                {item.category && (
                  <Badge 
                    className={cn(
                      "mb-3 font-medium border-0",
                      `bg-gradient-to-r ${gradientColor} text-white`
                    )}
                  >
                    {item.category}
                  </Badge>
                )}
                
                {item.studentCount && (
                  <div className="flex items-center gap-2">
                    <Users className={cn(
                      "h-4 w-4",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <p className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {item.studentCount} mahasiswa telah KP
                    </p>
                  </div>
                )}
              </div>

              {/* Arrow indicator */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                "opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0",
                isDarkMode 
                  ? "bg-gray-700" 
                  : "bg-gray-100"
              )}>
                <ArrowRight className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:translate-x-1",
                  isDarkMode ? "text-white" : "text-gray-700"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  gradient: string;
  isDarkMode: boolean;
}

function StatCard({ icon, value, label, gradient, isDarkMode }: StatCardProps) {
  return (
    <div className="group relative">
      <div className={cn(
        "absolute -inset-1 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity",
        `bg-gradient-to-r ${gradient}`
      )} />
      <div className={cn(
        "relative px-8 py-6 rounded-2xl text-center transition-all duration-300 group-hover:scale-105",
        isDarkMode 
          ? "bg-gray-800/80 backdrop-blur-xl" 
          : "bg-white/80 backdrop-blur-xl shadow-lg"
      )}>
        <div className={cn(
          "w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center",
          `bg-gradient-to-br ${gradient}`
        )}>
          {icon}
        </div>
        <p className={cn(
          "text-3xl font-black",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          {value}
        </p>
        <p className={cn(
          "text-sm font-medium mt-1",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          {label}
        </p>
      </div>
    </div>
  );
}

function Referensi() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Filter data based on search
  const filteredData = REFERENSI_DATA.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const totalStudents = REFERENSI_DATA.reduce((acc, item) => acc + (item.studentCount || 0), 0);

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
            "absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl",
            isDarkMode ? "bg-primary/5" : "bg-primary/10"
          )} />
          <div className={cn(
            "absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl",
            isDarkMode ? "bg-secondary/5" : "bg-secondary/10"
          )} />
          
          {/* Floating elements */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-10"
              style={{
                left: `${10 + i * 20}%`,
                top: `${15 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i * 0.5}s`
              }}
            >
              <Sparkles className={cn(
                "h-8 w-8",
                isDarkMode ? "text-primary" : "text-primary"
              )} />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
              isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
            )}>
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Tempat KP</span>
            </div>
            
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Referensi <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Tempat KP</span>
            </h1>
            <p
              className={cn(
                "text-xl max-w-2xl mx-auto leading-relaxed",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Temukan tempat Kerja Praktik yang sesuai dengan minat dan bidang kamu
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              {/* Glow effect */}
              <div className={cn(
                "absolute -inset-1 rounded-2xl blur-lg transition-opacity duration-300",
                isFocused ? "opacity-50" : "opacity-0",
                "bg-gradient-to-r from-primary to-secondary"
              )} />
              
              <div className="relative">
                <Search 
                  className={cn(
                    "absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors duration-300",
                    isFocused 
                      ? "text-primary" 
                      : isDarkMode ? "text-gray-400" : "text-gray-500"
                  )} 
                />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={cn(
                    "pl-14 pr-6 h-16 text-lg rounded-2xl border-2 transition-all duration-300",
                    isDarkMode 
                      ? "bg-gray-800/80 backdrop-blur-xl border-gray-700 text-white placeholder:text-gray-400" 
                      : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-xl",
                    isFocused && "border-primary ring-4 ring-primary/20"
                  )}
                  placeholder="Cari tempat KP berdasarkan nama..."
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <StatCard
              icon={<Building2 className="h-6 w-6 text-white" />}
              value={REFERENSI_DATA.length}
              label="Tempat KP Tersedia"
              gradient="from-primary to-blue-600"
              isDarkMode={isDarkMode}
            />
            <StatCard
              icon={<Users className="h-6 w-6 text-white" />}
              value={totalStudents}
              label="Total Mahasiswa KP"
              gradient="from-secondary to-orange-600"
              isDarkMode={isDarkMode}
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              value="98%"
              label="Tingkat Kepuasan"
              gradient="from-emerald-500 to-teal-600"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Referensi Grid */}
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, index) => (
                <ReferensiCard 
                  key={item.id} 
                  item={item} 
                  isDarkMode={isDarkMode}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 animate-ping">
                  <Building2 className="h-20 w-20 text-primary/30" />
                </div>
                <Building2 className={cn(
                  "h-20 w-20 relative",
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                )} />
              </div>
              <p className={cn(
                "text-xl font-medium",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Tidak ada tempat KP yang ditemukan
              </p>
              <p className={cn(
                "text-sm mt-2",
                isDarkMode ? "text-gray-500" : "text-gray-400"
              )}>
                Coba gunakan kata kunci lain
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Referensi;
