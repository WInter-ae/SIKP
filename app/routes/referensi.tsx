import { useState } from "react";
import { Link } from "react-router";
import { Search, Building2, ArrowRight } from "lucide-react";

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

// Components
interface ReferensiCardProps {
  item: ReferensiItem;
  isDarkMode: boolean;
}

function ReferensiCard({ item, isDarkMode }: ReferensiCardProps) {
  return (
    <Link to={`/detail-referensi/${item.id}`}>
      <Card
        className={cn(
          "group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border-0",
          isDarkMode 
            ? "bg-gray-800 hover:bg-gray-750" 
            : "bg-white hover:bg-gray-50 shadow-md"
        )}
      >
        <CardContent className="p-0">
          <div className="flex items-center gap-5 p-5">
            {/* Logo Placeholder */}
            <div
              className={cn(
                "w-20 h-20 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors duration-300",
                isDarkMode
                  ? "bg-gradient-to-br from-gray-700 to-gray-600"
                  : "bg-gradient-to-br from-primary to-secondary"
              )}
            >
              <Building2 className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-lg font-semibold mb-1 truncate transition-colors duration-300",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {item.name}
              </h3>
              {item.category && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "mb-2",
                    isDarkMode ? "bg-gray-700 text-gray-300" : ""
                  )}
                >
                  {item.category}
                </Badge>
              )}
              {item.studentCount && (
                <p
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  {item.studentCount} mahasiswa telah KP di sini
                </p>
              )}
            </div>

            {/* Arrow */}
            <ArrowRight 
              className={cn(
                "h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )} 
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Referensi() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data based on search
  const filteredData = REFERENSI_DATA.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Referensi Tempat KP
            </h1>
            <p
              className={cn(
                "text-lg max-w-2xl mx-auto",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Temukan tempat Kerja Praktik yang sesuai dengan minat dan bidang kamu
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search 
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )} 
              />
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className={cn(
                  "pl-12 h-14 text-base rounded-xl shadow-sm",
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400" 
                    : "bg-white border-gray-200"
                )}
                placeholder="Cari tempat KP berdasarkan nama..."
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <p
                className={cn(
                  "text-3xl font-bold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {REFERENSI_DATA.length}
              </p>
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Tempat KP Tersedia
              </p>
            </div>
            <div 
              className={cn(
                "w-px",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )} 
            />
            <div className="text-center">
              <p
                className={cn(
                  "text-3xl font-bold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {REFERENSI_DATA.reduce((acc, item) => acc + (item.studentCount || 0), 0)}
              </p>
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Total Mahasiswa KP
              </p>
            </div>
          </div>

          {/* Referensi Grid */}
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <ReferensiCard key={item.id} item={item} isDarkMode={isDarkMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 
                className={cn(
                  "h-16 w-16 mx-auto mb-4",
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                )} 
              />
              <p
                className={cn(
                  "text-lg",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Tidak ada tempat KP yang ditemukan
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
