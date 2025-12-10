import TransferRequestList from "./TransferRequestList";

export default function TransferRequestScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Transfer Requests</h1>
        <p className="text-muted-foreground">
          Manage prisoner transfer requests and approvals
        </p>
      </div>
      <TransferRequestList />
    </div>
  );
}
