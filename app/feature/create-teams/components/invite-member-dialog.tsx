import { useState } from "react";
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

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulasi API call dengan delay
    setTimeout(() => {
      if (searchQuery.trim()) {
        const results = mockStudents.filter(
          (student) =>
            !currentMemberIds.includes(student.id) &&
            (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              student.nim.includes(searchQuery) ||
              student.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleInvite = (member: SearchResult) => {
    onInviteMember(member);
    setSearchQuery("");
    setSearchResults([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Undang Anggota Tim</DialogTitle>
          <DialogDescription className="text-gray-700">
            Cari mahasiswa berdasarkan nama, NIM, atau email untuk diundang ke tim Anda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="search" className="text-gray-900">Cari Mahasiswa</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="search"
              placeholder="Masukkan nama, NIM, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? "Mencari..." : "Cari"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 font-semibold text-sm text-gray-700 border-b">
                Hasil Pencarian ({searchResults.length})
              </div>
              <ul className="divide-y">
                {searchResults.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.nim} • {student.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleInvite(student)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Undang
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
            <div className="mt-4 text-center py-8 text-gray-500">
              <p>Tidak ada mahasiswa ditemukan.</p>
              <p className="text-sm mt-1">Coba kata kunci lain.</p>
            </div>
          )}

          {!searchQuery.trim() && searchResults.length === 0 && (
            <div className="mt-4 text-center py-8 text-gray-400">
              <p className="text-sm">
                Masukkan nama, NIM, atau email untuk mencari mahasiswa
              </p>
            </div>
          )}
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
