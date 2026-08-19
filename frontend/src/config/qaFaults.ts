const requested = import.meta.env.VITE_QA_FAULTS?.trim().toLowerCase()

export const qaFaultsEnabled = requested !== "false"
