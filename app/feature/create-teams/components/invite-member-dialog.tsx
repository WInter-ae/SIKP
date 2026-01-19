import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";
import { Loader2, Search, Mail } from "lucide-react";
import { searchMahasiswa } from "../services/team-api";

// Define type locally to avoid export issues
type MahasiswaSearchResult = {
  id: string;
  name: string;
  nim: string;
  email: string;
  prodi?: string;
  fakultas?: string;
};

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteMember: (member: MahasiswaSearchResult) => void;
  currentMemberIds: string[];
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInviteMember,
  currentMemberIds,
}: InviteMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MahasiswaSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSearchError(null);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentMemberIds]);

  const performSearch = async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await searchMahasiswa(searchQuery);
      
      if (result.success && result.data) {
        // Filter out current members
        const filteredResults = result.data.filter(
          (student) => !currentMemberIds.includes(student.id)
        );
        setSearchResults(filteredResults);
        setShowResults(true);
      } else {
        setSearchError(result.error || "Gagal mencari mahasiswa");
        setSearchResults([]);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Terjadi kesalahan saat mencari mahasiswa");
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = (member: MahasiswaSearchResult) => {
    onInviteMember(member);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSearchError(null);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSearchError(null);
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Undang Anggota Tim</DialogTitle>
          <DialogDescription>
            Cari mahasiswa berdasarkan nama, NIM, atau email untuk diundang ke
            tim.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="search">Cari Mahasiswa</Label>
          <div className="relative mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Ketik nama, NIM, atau email..."
                value={searchQuery}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Error message */}
            {searchError && (
              <Card className="absolute z-50 w-full mt-1 shadow-lg border border-red-200 bg-red-50">
                <div className="p-4 text-sm text-red-700">
                  <p>❌ {searchError}</p>
                  <p className="text-xs mt-1">Pastikan koneksi internet stabil dan coba lagi</p>
                </div>
              </Card>
            )}

            {/* Results Dropdown */}
            {showResults && searchResults.length > 0 && !searchError && (
              <Card className="absolute z-50 w-full mt-1 shadow-lg border">
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-1">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                      {searchResults.length} mahasiswa ditemukan
                    </div>
                    {searchResults.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleInvite(student)}
                        className="w-full text-left px-3 py-3 hover:bg-accent transition-colors flex items-center gap-3 border-b last:border-b-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {student.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {student.nim}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-shrink-0"
                        >
                          Undang
                        </Button>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* No results message */}
            {showResults &&
              !isSearching &&
              searchResults.length === 0 &&
              searchQuery.trim().length >= 2 &&
              !searchError && (
                <Card className="absolute z-50 w-full mt-1 shadow-lg border">
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>Tidak ada mahasiswa ditemukan</p>
                    <p className="text-xs mt-1">Coba kata kunci lain atau periksa NIM/Nama</p>
                  </div>
                </Card>
              )}

            {/* Help text */}
            {!showResults && searchQuery.trim().length < 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                Ketik minimal 2 karakter untuk mulai pencarian
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
