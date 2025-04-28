import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Eye, Check, X, AlertTriangle } from "lucide-react";
import { formatDate } from "../../lib/utils";
import { Receipt } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import { getReceiptsByAmbassador, approveReceipt, rejectReceipt } from "../../api/receiptService";

interface ReceiptListProps {
  isAdmin?: boolean;
}

const ReceiptList: React.FC<ReceiptListProps> = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isReceiptDetailOpen, setIsReceiptDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  
  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchReceipts = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        const receiptData = await getReceiptsByAmbassador(currentUser.uid);
        setReceipts(receiptData);
        
        // If we got an empty array but no error, API might not be implemented yet
        if (receiptData.length === 0) {
          setApiAvailable(false);
        }
      } catch (error: any) {
        console.error("Error fetching receipts:", error);
        setError("Failed to fetch receipts. Please try again later.");
        setApiAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [currentUser]);

  const handleApprove = async () => {
    if (!selectedReceipt) return;
  
    // Validate required fields
    if (!selectedReceipt.id || !selectedReceipt.senderTgId || !selectedReceipt.amount) {
      setError("Missing required fields: receiptId, senderTgId, or amount.");
      return;
    }
  
    setIsActionLoading(true); // Set loading state to true
  
    try {
      const result = await approveReceipt({
        receiptId: selectedReceipt.id,
        senderId: selectedReceipt.senderTgId,
        amount: selectedReceipt.amount,
      });
  
      if (result.success) {
        // Update local state
        setReceipts(receipts.map(receipt => 
          receipt.id === selectedReceipt.id 
            ? { ...receipt, status: "approved" } 
            : receipt
        ));
        setError(null);
        toast.success("Receipt approved successfully!");
      } else {
        // Handle API not implemented yet
        setError(result.message || "Receipt API not fully implemented yet.");
        toast.warning("Receipt API not fully implemented yet.");
      }
  
      setIsConfirmationOpen(false);
      setIsReceiptDetailOpen(false);
    } catch (error: any) {
      console.error("Error approving receipt:", error);
      setError(error.message || "Failed to approve receipt. Please try again later.");
      toast.error("Failed to approve receipt.");
    } finally {
      setIsActionLoading(false); 
    }
  };
  
  const handleReject = async () => {
    if (!selectedReceipt) return;
  
    setIsActionLoading(true); 
  
    try {
      const result = await rejectReceipt({
        receiptId: selectedReceipt.id,
      });
  
      if (result.success) {
        // Update local state
        setReceipts(receipts.map(receipt => 
          receipt.id === selectedReceipt.id 
            ? { ...receipt, status: "rejected" } 
            : receipt
        ));
        setError(null);
        toast.success("Receipt rejected successfully!");
      } else {
        // Handle API not implemented yet
        setError(result.message || "Receipt API not fully implemented yet.");
        toast.warning("Receipt API not fully implemented yet.");
      }
  
      setIsConfirmationOpen(false);
      setIsReceiptDetailOpen(false);
    } catch (error: any) {
      console.error("Error rejecting receipt:", error);
      setError(error.message || "Failed to reject receipt. Please try again later.");
      toast.error("Failed to reject receipt.");
    } finally {
      setIsActionLoading(false); // Reset loading state
    }
  };

  const openConfirmationDialog = (type: "approve" | "reject", receipt: Receipt) => {
    setActionType(type);
    setSelectedReceipt(receipt);
    setIsConfirmationOpen(true);
    setError(null); // Clear error when opening the dialog
  };

  if (loading) return <p>Loading receipts...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Receipts</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!apiAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-amber-800">
            The receipt management system is not fully implemented yet. This feature will be available soon.
          </p>
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {apiAvailable 
                    ? "No receipts found" 
                    : "Receipt management system is not available yet"}
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id.slice(0, 8)}</TableCell>
                  <TableCell>{receipt.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${receipt.status === "approved" ? "bg-green-100 text-green-800" : receipt.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                      {receipt.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedReceipt(receipt); setIsReceiptDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Allow approval/rejection for ambassadors (role check) */}
                      {currentUser?.role === "ambassador" && receipt.status === "pending" && apiAvailable && (
                        <>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => openConfirmationDialog("approve", receipt)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => openConfirmationDialog("reject", receipt)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Receipt" : "Reject Receipt"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Are you sure you want to {actionType} this receipt?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsConfirmationOpen(false)} disabled={isActionLoading}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={actionType === "approve" ? handleApprove : handleReject}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <span className="flex items-center">
                  {actionType === "approve" ? "Approving..." : "Rejecting..."}
                </span>
              ) : (
                actionType === "approve" ? "Approve" : "Reject"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptDetailOpen} onOpenChange={setIsReceiptDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <p><strong>ID:</strong> {selectedReceipt.id}</p>
              <p><strong>Amount:</strong> {selectedReceipt.amount.toFixed(2)}</p>
              <p><strong>Currency:</strong> {selectedReceipt.currency}</p>
              <p><strong>Status:</strong> {selectedReceipt.status}</p>
              <p><strong>Date:</strong> {formatDate(selectedReceipt.createdAt)}</p>
              <p><strong>Document:</strong></p>
              {selectedReceipt.documents && selectedReceipt.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedReceipt.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline block"
                    >
                      View Document {index + 1}
                    </a>
                  ))}
                </div>
              ) : (
                <p>No document available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptList;