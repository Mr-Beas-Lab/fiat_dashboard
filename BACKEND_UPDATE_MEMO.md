# Field Change: Ambassador KYC Status

## Summary
The Ambassador model has been updated to use `kycStatus` instead of `kyc` for storing KYC verification status. The field now defaults to "pending" for all ambassadors.

## Required Backend Changes
Please update the following Firebase operations to use `kycStatus` instead of `kyc`:

1. When approving KYC applications:
   ```javascript
   // Change from
   await updateDoc(doc(db, "staffs", ambassadorId), { kyc: "approved" }, { merge: true });
   
   // To
   await updateDoc(doc(db, "staffs", ambassadorId), { kycStatus: "approved" }, { merge: true });
   ```

2. When rejecting KYC applications:
   ```javascript
   // Change from
   await updateDoc(doc(db, "staffs", ambassadorId), { kyc: "rejected" }, { merge: true });
   
   // To
   await updateDoc(doc(db, "staffs", ambassadorId), { kycStatus: "rejected" }, { merge: true });
   ```

3. When submitting KYC applications:
   ```javascript
   // Change from
   await updateDoc(doc(db, "staffs", ambassadorId), { kyc: "pending", photoUrl: photoUrl }, { merge: true });
   
   // To
   await updateDoc(doc(db, "staffs", ambassadorId), { kycStatus: "pending", photoUrl: photoUrl }, { merge: true });
   ```

4. When creating new ambassador accounts:
   ```javascript
   // Add this field to new ambassador creation
   kycStatus: "pending"
   ```

## Frontend Updates
The frontend code has been updated to use `kycStatus` instead of `kyc` in:
1. `src/types/index.ts`: Updated Ambassador interface to make kycStatus required with default value "pending"
2. `src/pages/AmbassadorDashboard.tsx`: Updated KYC status check
3. `src/components/admin/AmbassadorViewDialog.tsx`: Updated KYC status display to default to "pending" if not set

## Migration
A data migration script is needed to copy values from `kyc` to `kycStatus` for existing records. For any ambassadors without a value in either field, set `kycStatus` to "pending". 