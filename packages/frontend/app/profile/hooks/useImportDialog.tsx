import { useSimpleDialog } from "@/lib";
import { trpc } from "@/tracker";

export function useImportDialog() {
  return useSimpleDialog<{ userId: string }>({
    title: "Import from Anilist",
    renderContent: (
      <div>You can import only 50 last activities from Anilist.</div>
    ),
    confirmText: "Import",
    cancelText: "Cancel",
    maxWidth: 400,
    onConfirm: ({ userId }) => {
      console.log("userId", userId);
      console.log("trpc", trpc.fetchAnilistActivities.mutate);
      trpc.fetchAnilistActivities.mutate({ id: String(userId) });
    },
  });
}
