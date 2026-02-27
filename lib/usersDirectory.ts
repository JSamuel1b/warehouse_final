export type DeptHead = {
  id: string;
  name: string;
  department: string;
};

const DEPT_HEADS: DeptHead[] = [
  { id: "dh_1001", name: "Mark King", department: "MK" },
  { id: "dh_1002", name: "Sarah Lopez", department: "Custodial" },
  { id: "dh_1003", name: "John Rivera", department: "Maintenance" },
];

export function searchDeptHeads(query: string): DeptHead[] {
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