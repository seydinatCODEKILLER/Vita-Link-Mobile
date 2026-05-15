const isDev = process.env.NODE_ENV === "development";

const logger = {
  info: (msg: string, data?: any) => {
    if (isDev) console.log(`ℹ️  [VL] ${msg}`, data ?? "");
  },
  warn: (msg: string, data?: any) => {
    if (isDev) console.warn(`⚠️  [VL] ${msg}`, data ?? "");
  },
  error: (msg: string, data?: any) => {
    console.error(`❌ [VL] ${msg}`, data ?? "");
  },
};

export default logger;