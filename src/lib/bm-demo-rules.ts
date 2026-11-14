/** Fixed public evaluation account; never infer evaluation access from editable metadata. */
export const EVALUATION_USER_ID = "17bf46ba-da86-4e99-9cfb-3ae86d05d6a9";

export function isEvaluationAccount(userId: string | null | undefined): boolean {
  return userId === EVALUATION_USER_ID;
}