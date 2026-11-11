import workspaceDesign from "./workspace-design.css?inline";

// Vite extracts shared CSS before each lazy workspace's base CSS in production.
// Mount this scoped override after those styles so dev and built apps use the same cascade.
export default function WorkspaceDesign() {
  return <style data-mimo-workspace-design>{workspaceDesign}</style>;
}
