import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export const useTestStore = create((set) => ({
    testCases: [],
    loading: false,

    fetchTestCases: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get("/tests");
            set({ testCases: res.data });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            toast.error("Failed to load test cases");
        } finally {
            set({ loading: false });
        }
    },

    addTestCase: async (testCaseData) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/tests", testCaseData);
            set((state) => ({ testCases: [...state.testCases, res.data] }));
            toast.success("Test case added successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add test case");
        } finally {
            set({ loading: false });
        }
    },

    updateTestCase: async (id, testCaseData) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.put(`/tests/${id}`, testCaseData);
            set((state) => ({
                testCases: state.testCases.map((testCase) =>
                    testCase._id === id ? res.data : testCase
                ),
            }));
            toast.success("Test case updated successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update test case");
        } finally {
            set({ loading: false });
        }
    },

    deleteTestCase: async (id) => {
        set({ loading: true });
        try {
            await axiosInstance.delete(`/tests/${id}`);
            set((state) => ({
                testCases: state.testCases.filter((testCase) => testCase._id !== id),
            }));
            toast.success("Test case deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete test case");
        } finally {
            set({ loading: false });
        }
    },

    getTestCaseById: async (id) => {
        try {
            const res = await axiosInstance.get(`/tests/${id}`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to get test case");
        }
    },
}));
