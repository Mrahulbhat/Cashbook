import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";

export const useIouStore = create((set) => ({
    ious: [],
    loading: false,

    fetchIous: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get("/iou");
            set({ ious: res.data });
        } catch (error) {
            toast.error("Failed to fetch IOUs");
        } finally {
            set({ loading: false });
        }
    },

    addIou: async (iouData) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/iou", iouData);
            set((state) => ({ ious: [res.data, ...state.ious] }));
            toast.success("IOU created!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create IOU");
        } finally {
            set({ loading: false });
        }
    },

    settleIou: async (id, settleData) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.put(`/iou/${id}`, settleData);
            set((state) => ({
                ious: state.ious.map((iou) => (iou._id === id ? res.data : iou)),
            }));
            toast.success(res.data.status === "settled" ? "IOU fully settled! 🎉" : "Partial payment recorded");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to settle IOU");
        } finally {
            set({ loading: false });
        }
    },

    deleteIou: async (id) => {
        set({ loading: true });
        try {
            await axiosInstance.delete(`/iou/${id}`);
            set((state) => ({ ious: state.ious.filter((iou) => iou._id !== id) }));
            toast.success("IOU deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete IOU");
        } finally {
            set({ loading: false });
        }
    },
}));
