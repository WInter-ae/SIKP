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
import { Loader2, Search, Users } from "lucide-react";
import { searchTeams } from "~/feature/create-teams/services/team-api";

interface JoinTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinTeam: (teamCode: string) => void;
}

interface TeamSuggestion {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  leaderNim: string;
  leaderName: string;
}

export function JoinTeamDialog({
  open,
  onOpenChange,
  onJoinTeam,
}: JoinTeamDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamCode, setSelectedTeamCode] = useState("");
  const [suggestions, setSuggestions] = useState<TeamSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search by NIM ketua
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await searchTeams(searchQuery.trim());
        if (response.success && response.data) {
          setSuggestions(response.data);
          setShowSuggestions(response.data.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error searching teams:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codeToJoin = selectedTeamCode || searchQuery.trim();
    if (!codeToJoin) {
      alert("Kode tim tidak boleh kosong");
      return;
    }

    // Jika user memilih dari hasil pencarian, cegah join ke tim penuh (>=3)
    const selectedSuggestion = suggestions.find(
      (s) => s.code === codeToJoin || `${s.leaderNim} - ${s.leaderName}` === codeToJoin,
    );
    if (selectedSuggestion && selectedSuggestion.memberCount >= 3) {
      alert("❌ Tim ini sudah penuh (maksimal 3 anggota)");
      return;
    }

    onJoinTeam(codeToJoin);
    setSearchQuery("");
    setSelectedTeamCode("");
    setSuggestions([]);
    setShowSuggestions(false);
    onOpenChange(false);
  };

  const handleSelectSuggestion = (suggestion: TeamSuggestion) => {
    if (suggestion.memberCount >= 3) {
      alert("❌ Tim ini sudah penuh (maksimal 3 anggota)");
      return;
    }
    setSearchQuery(`${suggestion.leaderNim} - ${suggestion.leaderName}`);
    setSelectedTeamCode(suggestion.code);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedTeamCode(value.trim()); // Izinkan join langsung pakai kode tim
    if (value.trim().length >= 1) {
      setShowSuggestions(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Gabung Tim</DialogTitle>
            <DialogDescription>
              Masukkan kode tim (atau NIM ketua) untuk mencari dan bergabung.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="teamCode">Kode Tim</Label>
            <div className="relative mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="teamCode"
                  placeholder="Masukkan kode tim atau NIM ketua..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  autoComplete="off"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute z-50 w-full mt-1 shadow-lg border">
                  <div className="max-h-[200px] overflow-y-auto">
                    <div className="p-1">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center justify-between group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Ketua: {suggestion.leaderName} (
                              {suggestion.leaderNim})
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {suggestion.code}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground ml-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">
                              {suggestion.memberCount}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* No results message */}
              {showSuggestions &&
                !isSearching &&
                suggestions.length === 0 &&
                searchQuery.trim().length >= 1 && (
                  <Card className="absolute z-50 w-full mt-1 shadow-lg border">
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Tidak ada tim ditemukan
                    </div>
                  </Card>
                )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Contoh: TEAM-MKO4EO2W-VVPI0Z atau 2021001
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedTeamCode("");
                setSuggestions([]);
                setShowSuggestions(false);
                onOpenChange(false);
              }}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!selectedTeamCode}>
              Gabung
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
