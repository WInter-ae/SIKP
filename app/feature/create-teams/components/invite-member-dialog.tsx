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

interface SearchResult {
  id: number;
  name: string;
  nim: string;
  email: string;
}

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteMember: (member: SearchResult) => void;
  currentMemberIds: number[];
}

// Mock data - nanti bisa diganti dengan API call
const mockStudents: SearchResult[] = [
  { id: 5, name: "Budi Santoso", nim: "2021001", email: "budi@email.com" },
  { id: 6, name: "Siti Nurhaliza", nim: "2021002", email: "siti@email.com" },
  { id: 7, name: "Ahmad Dahlan", nim: "2021003", email: "ahmad@email.com" },
  { id: 8, name: "Rina Kartika", nim: "2021004", email: "rina@email.com" },
  { id: 9, name: "Dewi Sartika", nim: "2021005", email: "dewi@email.com" },
  { id: 10, name: "Fajar Sidik", nim: "2021006", email: "fajar@email.com" },
  { id: 11, name: "Lina Marlina", nim: "2021007", email: "lina@email.com" },
  { id: 12, name: "Rizky Pratama", nim: "2021008", email: "rizky@email.com" },
];

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInviteMember,
  currentMemberIds,
}: InviteMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);

      // Simulasi API call - nanti ganti dengan real API
      setTimeout(() => {
        const results = mockStudents.filter(
          (student) =>
            !currentMemberIds.includes(student.id) &&
            (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              student.nim.includes(searchQuery) ||
              student.email.toLowerCase().includes(searchQuery.toLowerCase())),
        );
        setSearchResults(results);
        setShowResults(true);
        setIsSearching(false);
      }, 300);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentMemberIds]);

  const handleInvite = (member: SearchResult) => {
    onInviteMember(member);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
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

            {/* Results Dropdown */}
            {showResults && searchResults.length > 0 && (
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
              searchQuery.trim().length >= 2 && (
                <Card className="absolute z-50 w-full mt-1 shadow-lg border">
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>Tidak ada mahasiswa ditemukan</p>
                    <p className="text-xs mt-1">Coba kata kunci lain</p>
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
