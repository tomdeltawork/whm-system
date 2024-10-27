// app/actions.ts
'use server';

export async function incrementCounter(currentCount: number): Promise<number> {
  // 模擬伺服器端操作，例如保存到數據庫
  return currentCount + 1;
}
