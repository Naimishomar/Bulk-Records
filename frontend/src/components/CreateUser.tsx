import { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";

interface FormData {
  FMID: string;
  IDNumber: string;
  date: string;
  pendingAmount: string;
}

const RegisterFMIDForm = () => {
  const [formData, setFormData] = useState<FormData>({
    FMID: "",
    IDNumber: "",
    date: new Date().toISOString().split("T")[0],
    pendingAmount: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await axios.post("http://localhost:3000/payment-records", {
        FMID: formData.FMID.trim(),
        IDNumber: formData.IDNumber.trim(),
        date: formData.date,
        pendingAmount: parseFloat(formData.pendingAmount),
      });

      if (res.status === 201) {
        setMessage("FMID registered successfully!");
        setFormData({
          FMID: "",
          IDNumber: "",
          date: "",
          pendingAmount: "",
        });
      }
    } catch (err : any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Register FMID</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="FMID"
          value={formData.FMID}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("FMID", e.target.value)
          }
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="ID Number"
          value={formData.IDNumber}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("IDNumber", e.target.value)
          }
          className="border p-2 w-full"
          required
        />
        <input
          type="date"
          placeholder="Date"
          value={formData.date}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("date", e.target.value)
          }
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          placeholder="Pending Amount"
          value={formData.pendingAmount}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("pendingAmount", e.target.value)
          }
          className="border p-2 w-full"
          required
          min="0"
          step="0.01"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      {message && <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
      {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
    </div>
  );
};

export default RegisterFMIDForm;
