export const cleanDto = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== null && v !== undefined && v !== "",
    ),
  );
