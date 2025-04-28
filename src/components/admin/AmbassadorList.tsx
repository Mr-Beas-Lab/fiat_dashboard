import { Ambassador } from "../../types";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Trash2, Eye } from "lucide-react";
import { toast } from "../ui/use-toast";

interface AmbassadorListProps {
  ambassadors: Ambassador[];
  onDelete: (ambassadorId: string) => void;
  onView: (ambassador: Ambassador) => void;
}

export default function AmbassadorList({ ambassadors, onDelete, onView }: AmbassadorListProps) {
  // Improve the delete handling to strictly require Firebase UID
  const handleDelete = (e: React.MouseEvent, ambassador: Ambassador) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Log the entire ambassador object to see what identifiers are available
    console.log("Delete button clicked for ambassador:", JSON.stringify(ambassador, null, 2));
    
    // Firebase requires uid as the primary identifier
    if (!ambassador.uid) {
      console.error("Firebase UID is required for deletion but was not found:", ambassador);
      toast({
        title: "Error",
        description: "Cannot delete this ambassador: Firebase UID is missing",
        variant: "destructive",
      });
      return;
    }
    
    // Verify it looks like a Firebase UID (20+ characters, not an email)
    if (ambassador.uid.length < 20 || ambassador.uid.includes('@')) {
      console.error("Invalid Firebase UID format:", ambassador.uid);
      toast({
        title: "Error",
        description: "Invalid Firebase UID format",
        variant: "destructive",
      });
      return;
    }
    
    // Use the Firebase UID for deletion
    console.log(`Using Firebase UID for deletion: ${ambassador.uid}`);
    onDelete(ambassador.uid);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Telegram Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ambassadors.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No ambassadors found
            </TableCell>
          </TableRow>
        ) : (
          ambassadors.map((ambassador) => {
            // Generate a unique key using multiple properties in case id is undefined
            const rowKey = ambassador.id || ambassador.uid || `${ambassador.email}-${ambassador.tgUsername}`;
            
            return (
              <TableRow key={rowKey}>
                <TableCell>{ambassador.firstName}</TableCell>
                <TableCell>{ambassador.lastName}</TableCell>
                <TableCell>{ambassador.tgUsername}</TableCell>
                <TableCell>{ambassador.email}</TableCell>
                <TableCell>{ambassador.phone}</TableCell>

                <TableCell className="flex justify-end space-x-2">
                  <Button 
                    key={`view-${rowKey}`}
                    size="sm" 
                    variant="outline"
                    onClick={() => onView(ambassador)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button 
                    key={`delete-${rowKey}`}
                    size="sm" 
                    variant="destructive"
                    onClick={(e) => handleDelete(e, ambassador)}
                    className="h-8 w-8 p-0"
                    type="button"
                    title={ambassador.uid ? "Delete ambassador" : "Cannot delete - Missing UID"}
                    disabled={!ambassador.uid}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}