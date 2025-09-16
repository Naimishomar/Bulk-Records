import { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";

interface Payment {
  FMID: string;
  amount: string;
}

interface Result {
  FMID: string;
  status: "success" | "error";
  message: string;
  pendingAmount?: number;
}

const Payment = () => {
  const [fmidInput, setFmidInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  const parseAmounts = () => {
    return amountInput
      .split(",")
      .map((a) => parseFloat(a.trim()))
      .filter((a) => !isNaN(a));
  };

  const getRemainingAmount = () => {
    const total = parseFloat(totalAmount) || 0;
    const assigned = parseAmounts().reduce((sum, amt) => sum + amt, 0);
    return total - assigned;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResults([]);
    setWarning(null);

    const fmids = fmidInput.split(",").map((f) => f.trim()).filter((f) => f);
    const amounts = amountInput.split(",").map((a) => a.trim()).filter((a) => a);

    if (fmids.length !== amounts.length) {
      setWarning("The number of FMIDs and amounts must match.");
      return;
    }

    const remaining = getRemainingAmount();
    if (remaining < 0) {
      setWarning("Assigned amounts exceed the total amount.");
      return;
    }

    const payments: Payment[] = fmids.map((fmid, index) => ({
      FMID: fmid,
      amount: amounts[index],
    }));

    try {
      const res = await axios.post<{ results: Result[] }>(
        "http://localhost:3000/payment-records/multiple",
        {
          payments: payments.map((p) => ({
            FMID: p.FMID,
            amount: parseFloat(p.amount),
          })),
        }
      );
      setResults(res.data.results);
    } catch (error) {
      console.error(error);
      alert("Error processing payments");
    }
  };

  const getPendingAmount = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/payment-records/pending-amount",
        {
          FMID: fmidInput,
        }
      );
      setPendingAmount(res.data.pendingAmount);
    } catch (error) {
      console.error(error);
      alert("Error getting pending amount");
    }
  };

  const remainingAmount = getRemainingAmount();

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add Payments</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Total Amount</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalAmount(e.target.value)}
            placeholder="Enter total amount"
            className="border p-2 w-full"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">FMIDs (comma separated)</label>
          <input
            type="text"
            value={fmidInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFmidInput(e.target.value)}
            placeholder="FM123, FM456, FM789"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="">
          <div>
            <label className="block mb-1 font-medium">Pending Amount</label>
            <input
              type="number"
              value={pendingAmount ?? ""}
              readOnly
              placeholder="Pending amount will be shown here"
              className="border p-2 w-full bg-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={getPendingAmount}
            className="bg-blue-500 text-white h-10 rounded w-full hover:bg-blue-600 mt-5"
          >
            Get Pending Amount
          </button>
        </div>
        <div>
          <label className="block mb-1 font-medium">Amounts (comma separated)</label>
          <input
            type="text"
            value={amountInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountInput(e.target.value)}
            placeholder="1000, 500, 750"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="text-sm font-medium">
          Remaining Amount: <span className={remainingAmount < 0 ? "text-red-600" : "text-green-600"}>
            {remainingAmount.toFixed(2)}
          </span>
        </div>
        {warning && (
          <div className="text-red-600 text-sm">
            {warning}
          </div>
        )}
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded w-full hover:bg-green-600 disabled:opacity-50"
          disabled={remainingAmount < 0}
        >
          Submit
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Results:</h3>
        {results.length === 0 && <p>No results yet.</p>}
        {results.map((result, index) => (
          <div key={index} className="border p-2 mb-2 rounded">
            <p><strong>FMID:</strong> {result.FMID}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Message:</strong> {result.message}</p>
            {result.status === "success" && result.pendingAmount !== undefined && (
              <p><strong>Pending Amount:</strong> {result.pendingAmount.toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payment;
