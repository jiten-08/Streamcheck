const requested = import.meta.env.VITE_QA_FAULTS?.trim().toLowerCase()

export const qaFaultsEnabled = !import.meta.env.PROD && requested !== "false"
