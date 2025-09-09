import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleData = [
  {
    id: 1,
    plantName: "Technocraft_Shivale",
    client: "Technocraft Industries India Ltd",
    dcCapacity: "687.925 KW",
    module: "Polycrystalline",
    mountType: "Rooftop"
  },
  {
    id: 2,
    plantName: "Pokhran Solar Park",
    client: "Dynamic Probe",
    dcCapacity: "456 MW",
    module: "Polycrystalline",
    mountType: "Ground Mounted"
  },
  {
    id: 3,
    plantName: "Tata Motors Pune Block - H",
    client: "Tata Motors Limited",
    dcCapacity: "350.46 KW",
    module: "Polycrystalline",
    mountType: "Rooftop"
  },
  {
    id: 4,
    plantName: "KSIPL_Hinduja_20MW",
    client: "HindujaRenewables",
    dcCapacity: "22.032 MW",
    module: "Polycrystalline",
    mountType: "Ground Mounted"
  },
  {
    id: 5,
    plantName: "Tata Motors Pune Block - D",
    client: "Tata Motors Pune",
    dcCapacity: "350.46 KW",
    module: "Polycrystalline",
    mountType: "Rooftop"
  },
  {
    id: 6,
    plantName: "TVS Motors - ?",
    client: "TVS Motors Limited",
    dcCapacity: "62 KW",
    module: "Polycrystalline",
    mountType: "Rooftop"
  }
];

export function MainContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");

  const filteredData = sampleData.filter(item =>
    item.plantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage);
    if (pageNumber && pageNumber > 0) {
      setCurrentPage(pageNumber);
      setGoToPage("");
    }
  };

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search plants…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Plant Name</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">DC Capacity</TableHead>
                <TableHead className="font-semibold">Module</TableHead>
                <TableHead className="font-semibold">Mount Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow 
                  key={item.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <button className="text-primary font-medium hover:underline text-left">
                      {item.plantName}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.client}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.dcCapacity}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {item.module}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.mountType === "Ground Mounted" 
                        ? "bg-accent/10 text-accent" 
                        : "bg-info/10 text-info"
                    }`}>
                      {item.mountType}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of 1
          </span>
          <Button variant="outline" size="sm" disabled={currentPage === 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Go to page:</span>
          <Input
            type="number"
            placeholder="1"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            className="w-16 h-8"
          />
          <Button size="sm" onClick={handleGoToPage}>
            Go
          </Button>
        </div>
      </div>
    </main>
  );
}