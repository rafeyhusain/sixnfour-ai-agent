import { DashboardService } from "@/sdk/services/dashboard-service";
import { useEffect, useState } from "react";

export type SaveDataType = () => Promise<void>;

export function useData<T>(name: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  function getErrorDetails(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === "string") {
      return err;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  const reset = () => {
    setError(false);
    setLoading(true);
    setMessage(null);
  }

  const failed = (message: string, err: unknown) => {
    setError(true);
    setMessage(`${message} Details: ${getErrorDetails(err)}`);
    console.error(err);
  }

  const success = (message: string, data: T[]) => {
    setError(false);
    setData(data);
    setMessage(message);
  }

  useEffect(() => {
    async function fetchData() {
      // Inline reset to avoid extra dependencies in effect
      setError(false);
      setLoading(true);
      setMessage(null);
      try {
        const result = await DashboardService.getTable<T>(name) as T[];
        setError(false);
        setData(result);
        setMessage("Loaded successfully!");
      } catch (err: unknown) {
        setError(true);
        setMessage(`Failed to load data Details: ${getErrorDetails(err)}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  const saveData = async () => {
    reset();
    
    try {
      await DashboardService.setTable<T>(name, data);
      success("Saved successfully!", data);
    } catch (err: unknown) {
      failed("Failed to save. Ensure your JSON is valid.", err);
    } finally {
      setLoading(false);
    }
  }

  const setJson = async (json: string) => {
    reset();

    try {
      const result = JSON.parse(json) as T[];
      setData(result);
    } catch (err: unknown) {
      failed("Failed to set JSON. Ensure your JSON is valid.", err);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, message, saveData, setJson };
}