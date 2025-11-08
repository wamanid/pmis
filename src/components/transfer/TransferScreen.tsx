import TransferList from "./TransferList";

export default function TransferScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Transfer In/Out</h1>
        <p className="text-muted-foreground">
          Manage prisoner transfers between stations
        </p>
      </div>
      <TransferList />
    </div>
  );
}
