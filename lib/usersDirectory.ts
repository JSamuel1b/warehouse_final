export type DeptHead = {
  id: string;
  name: string;
  department: string;
  departmentId?: number;
  pinCode?: string;
};

export function searchDeptHeads(query: string, DEPT_HEADS: DeptHead[]): DeptHead[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return DEPT_HEADS;

  return DEPT_HEADS.filter((d) => {
    return (
      d.name.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  });
}